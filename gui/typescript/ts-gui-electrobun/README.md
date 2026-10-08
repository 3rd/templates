# ts-gui-electrobun

Electrobun desktop application starter. The application process is TypeScript run by Bun; the
window is a system webview (WebKitGTK on Linux, WKWebView on macOS, WebView2 on Windows), not a
bundled Chromium.

## Setup

Install Nix. On NixOS, also enable `nix-ld` or provide a compatible loader at `/lib64` before
the first build: Electrobun executes its downloaded CLI before `make relink` can patch it.
Every `make` target re-enters the dev shell on its own, so

```bash
make build
```

works from a plain shell, and the project does not have to live in a git repository. Run
`nix develop` yourself when you want an interactive shell; targets invoked from inside it skip
the re-entry.

The dev shell provides Bun, Node 24, npm, GNU make, and, on Linux, the WebKitGTK and GTK
libraries the built application links against, plus `patchelf`.

## Commands

```bash
make help     # list commands
make dev      # build and run, rebuilding on change
make build    # build the app into build/
make run      # build, then launch the app
make test     # bun test when a test file exists
make lint     # typecheck the sources
make fmt      # prettier over the sources, nixfmt over flake.nix
make clean    # remove build/, artifacts/, and node_modules/
make verify   # lint, test, build
```

Every target installs dependencies first through `npm ci` when `node_modules` is missing or
stale.

## Structure

`src/bun/index.ts` is the application process. It opens a resizable window and points it at the
view.

`src/mainview/index.html` and `src/mainview/index.ts` are the window contents. The starter
shell (tabs, counter, note, settings) is local state in the webview.

`electrobun.config.ts` names the app, declares the view entry points, and lists the files copied
into the bundle. `bundleCEF` is off on every platform, so the app uses the system webview and
stays small.

Build output lands in `build/dev-<platform>/`, with the launcher at `bin/launcher`. `make run`
starts that launcher through `electrobun run`, which does not rebuild; `make dev` uses
`electrobun dev --watch`, which does.

## Notes

This template pins Electrobun 1.18.1, the last release of the 1.x line, not 2.0.1. Electrobun 2.x
no longer ships its APIs through npm. The npm package is a bootstrap: it downloads a `hutch`
launcher, which downloads a `cottontail` runtime and projects an SDK into a machine-wide
`~/.hutch` store. Nothing in that chain is pinned by `package-lock.json`, and no nixpkgs package
provides it, so the dev shell cannot make `make build` work for someone who has only run
`nix develop`. That is the reason for the pin, and it holds regardless of whether the download
happens to succeed on any given day. Revisit 2.x when its toolchain can be pinned from a
lockfile.

Dependencies are installed with npm rather than Bun, so installs follow your npm configuration,
including policies such as `min-release-age` that Bun's installer does not read. Bun still runs
the application process and the tests.

Electrobun downloads its own prebuilt CLI and core binaries from GitHub releases on the first
build, about 95 MB, into `node_modules/electrobun`. They are cached there, so later builds are
offline, but the first `make build` needs network access.

Those binaries expect the Linux loader at `/lib64/ld-linux-*.so`, which does not exist on NixOS.
`make build` runs `make relink` afterward, which rewrites each downloaded executable to the
loader in the dev shell. It patches the copies under `node_modules/electrobun` as well as the
ones under `build/`, because every build copies from `node_modules`; patching only `build/` is
undone by the next rebuild. The step is a no-op when `NIX_DYNAMIC_LINKER` is unset, which is the
case on macOS.

One gap that `relink` cannot close: Electrobun downloads its CLI and then immediately executes
it, before anything exists to patch. On NixOS that first execution needs `nix-ld` or another
loader at `/lib64`. Every later command is fine, because by then `relink` has run. Ordinary Linux
distributions are unaffected.

`@types/bun` is pinned to 1.3.8 because Electrobun 1.18.1 ships TypeScript source rather than
declaration files, and its FFI pointer types do not compile against later Bun type definitions.
`@types/three` is a dev dependency for the same reason: Electrobun imports `three`, which ships
no types of its own at the version Electrobun requires.

The window's WM_CLASS is `ElectrobunKitchenSink-dev`, hard-coded in the Electrobun 1.x native
wrapper. It affects the desktop's window grouping, not the title.

Application menus are not supported on Linux; Electrobun prints that at startup. Build menu UI
inside the webview.

Rename points when you copy this template: `name` and `description` in `package.json`, `app.name`
and `app.identifier` in `electrobun.config.ts`, the `title` passed to `BrowserWindow` in
`src/bun/index.ts`, the `<title>` and `<h1>` in `src/mainview/index.html`, and `description` in
`flake.nix`.
