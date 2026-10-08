# ts-gui-nodegui

NodeGui desktop application starter: TypeScript drives real Qt 6 widgets through NodeGui's plain
widget API, and the app runs on Qode, a Node.js build that shares its event loop with Qt. There is
no webview and no UI framework.

## Setup

Nix is the only requirement, on NixOS too: nothing in the install or the running app needs
`nix-ld` or a loader at `/lib64`. Every `make` target re-enters the dev shell on its own, so

```bash
make build
```

works from a plain shell, and the project does not have to live in a git repository. Run
`nix develop` yourself when you want an interactive shell; targets invoked from inside it skip
the re-entry.

The dev shell provides Node 24, npm, Bun, GNU make, watchexec, and, on Linux, the X11, Wayland,
OpenGL, font, and D-Bus libraries that NodeGui's bundled Qt links against, plus `p7zip` and
`patchelf`.

## Commands

```bash
make help     # list commands
make dev      # run the app, rebuilding and restarting on change
make build    # bundle src/ into dist/index.js
make run      # build, then launch the app
make test     # bun test
make lint     # typecheck the sources
make fmt      # prettier over the sources, nixfmt over flake.nix
make clean    # remove dist/ and node_modules/
make verify   # lint, test, build
```

Every target installs dependencies first through `npm ci` when `node_modules` is missing or
stale. That step also fetches Qode, Qt, and the NodeGui native addon, as described under Notes.

## Structure

`src/index.ts` is the application. It builds the window from NodeGui widgets: a header, a
`QTabWidget` with the Home, Notes, and Settings pages, and a status line, laid out with
`QBoxLayout`. Each control's signal calls `update`, which replaces the workspace state and
re-renders the count, preview, and status labels. A short Qt style sheet colors the header, badge,
and status line. The last line stores the window on `globalThis`, the pattern NodeGui documents
for keeping the window wrapper from being garbage collected.

`src/workspace.ts` holds the state type and the text derived from it, including the status line.
It does not import NodeGui, so `bun test` loads it without Qt. `src/workspace.test.ts` covers the
status line, including the code-point character count on the Notes tab.

`make build` bundles `src/index.ts` into a single CommonJS file, `dist/index.js`, with
`bun build`. `@nodegui/nodegui` stays external: its own code loads the native addon by a path
relative to its package, so it has to run from `node_modules`. The bundle command lives in the
`build` script in `package.json`, which `make build` and `make dev` both run.

`tsconfig.json` covers `src/` for the typecheck only; Bun does the emitting.

## Notes

This template pins `@nodegui/nodegui` to exactly 0.74.2, released 2026-05-03. That version
selects the prebuilt addon it downloads, pins Qode 24.12.0-rc19 (Node 24.12), and pins Qt 6.10.2
in its `config/qtConfig.js`. Bump them together by bumping NodeGui. The template uses the plain
widget API; React NodeGui has been unmaintained since 2022.

Only Qode can run the app. NodeGui's addon imports `qode::InjectCustomRunLoop` and two related
symbols from the host process, which is how Qt's event loop is driven alongside libuv. Plain Node
and Bun do not export them, so both stop at `undefined symbol: _ZN4qode9qode_argvE` when loading
NodeGui. Bun bundles and tests, and `src/workspace.ts` stays free of NodeGui imports for that
reason.

NodeGui's official starter bundles with webpack: ts-loader for the sources plus loaders that copy
native addons and images into `dist/`, next to `@nodegui/packer`. This template has no packaging
step and no image assets, so `bun build`, already in the shell as the test runner, bundles the one
entry point with no config file and no extra dependency.

`make dev` runs watchexec over `src/`. Each source change stops the app, rebundles, and starts it
again, so state resets on every change; there is no hot reload. Closing the window leaves
watchexec waiting for the next change; Ctrl-C stops it. Qode's own `--watch` mode is not used:
once the app exits, its watcher spins a CPU core and ignores Ctrl-C.

Dependencies are installed with npm rather than Bun, so installs follow your npm configuration,
including policies such as `min-release-age` that Bun's installer does not read. The Makefile runs
`npm ci --ignore-scripts` and then NodeGui's three download steps itself, so installs behave the
same whatever your `ignore-scripts` setting is, and the loader patch below lands between them.

The first install downloads about 82 MB and unpacks about 330 MB into `node_modules`: the Qode
binary (44 MB) from the `nodegui/qodejs` GitHub releases, Qt 6.10.2 base, SVG, and ICU (35 MB)
from `download.qt.io`, and the addon (3 MB) from the `nodegui/nodegui` GitHub releases. The
archives are cached in your user cache directory (`~/.cache` on Linux) under `qode-nodejs`,
`nodegui-mini-qt-nodejs`, and `nodegui-core-nodejs`, so a reinstall after `make clean` is
offline. `package-lock.json` does not pin these archives; the NodeGui version does.

The app runs on that bundled Qt 6.10.2, not on a nixpkgs Qt. The pinned nixpkgs carries Qt 6.11.2,
while the prebuilt addon was compiled against 6.10.2, finds it through its RUNPATH
(`$ORIGIN/../../miniqt/6.10.2/gcc_64/lib`), and requires the `Qt_6.10` symbol version. NodeGui's
`QT_INSTALL_DIR` only skips the Qt download; matching a nixpkgs Qt would mean compiling the addon
from source with cmake-js and a C++ toolchain on every install. The dev shell therefore supplies
only the system libraries the bundled Qt links against, through `LD_LIBRARY_PATH`.

Qode is the only downloaded executable that runs, and it expects the Linux loader at
`/lib64/ld-linux-*.so`, which does not exist on NixOS. Right after downloading it, the install
step rewrites its interpreter to the dev shell's loader with `patchelf`; the step is a no-op when
`NIX_DYNAMIC_LINKER` is unset, which is the case on macOS. NodeGui extracts its archives with the
prebuilt `7za` from `7zip-bin`, which has the same loader problem, so the dev shell sets
`USE_SYSTEM_7ZA` and NodeGui uses the `7za` from nixpkgs `p7zip` instead.

The bundled Qt ships only the Fusion and Windows styles, so a desktop-wide `QT_STYLE_OVERRIDE`
such as `kvantum` prints a warning at startup and the app falls back to Fusion.

`npm ci` reports audit advisories for `tar` 6 and `postcss` 7, which NodeGui 0.74.2 and Qode
depend on. npm's suggested fix is a downgrade to NodeGui 0.37, so ignore it.

NodeGui and Qode are MIT-licensed. Qt is used under the LGPLv3, which a closed-source, paid app
can satisfy when Qt stays in separate shared libraries that users can replace, the app ships
Qt's license text along with Qt's source or a written offer for it, and the app's terms do not
forbid replacing Qt or reverse engineering to debug such a replacement. An app that cannot meet
those conditions needs a commercial Qt license.

There is no packaging step. Add `@nodegui/packer` when you need a distributable; nothing in this
template assumes it.

No linter is configured. `make lint` is a strict typecheck of the sources.

Verified on NixOS x86_64 under Xvfb: `make verify`, `make fmt`, `make run` with every control
driven, the `make dev` restart on a source change and its Ctrl-C stop with the window open and
after closing it, and a clean install and run with `/lib64` hidden in a private mount namespace.
Not verified: macOS, a Wayland session, and other Linux distributions. NodeGui publishes no Linux
arm64 binaries and its Qt download is x86_64-only on Linux, so the `aarch64-linux` dev shell
evaluates but the app cannot install there.

Rename points when you copy this template: `name` and `description` in `package.json`,
`APP_NAME` in `src/index.ts` (window title, header title, and default display name), the
`displayName` fixture in `src/workspace.test.ts`, and `description` in `flake.nix`.
