# ts-gui-electron

Electron desktop application starter: TypeScript sources for the main, preload, and renderer
processes, bundled by electron-vite. The renderer is plain TypeScript and DOM, with no UI
framework.

## Setup

Nix is the only requirement. Every `make` target re-enters the dev shell on its own, so

```bash
make build
```

works from a plain shell, and the project does not have to live in a git repository. Run
`nix develop` yourself when you want an interactive shell; targets invoked from inside it skip
the re-entry.

The dev shell provides Node 24, npm, Bun, GNU make, and the Electron 44 build from nixpkgs. It
also sets `ELECTRON_SKIP_BINARY_DOWNLOAD`, `ELECTRON_OVERRIDE_DIST_PATH`, and
`ELECTRON_EXEC_PATH` so the `electron` npm package never downloads a prebuilt binary and every
tool launches the Electron in the shell.

## Commands

```bash
make help     # list commands
make dev      # electron-vite dev, renderer hot reload
make build    # bundle main, preload, and renderer into out/
make run      # build, then launch the app
make test     # bun test
make lint     # typecheck the node and web projects
make fmt      # prettier over the sources, nixfmt over flake.nix
make clean    # remove out/ and node_modules/
make verify   # lint, test, build
```

Every target installs dependencies first through `npm ci` when `node_modules` is missing or
stale.

## Structure

`src/main` is the main process: it creates a resizable window and registers the one IPC handler.
`src/main/runtime.ts` holds the handler's payload logic and `src/main/runtime.test.ts` covers it.

`src/preload` runs with context isolation on and exposes a single typed function on
`window.api` through `contextBridge`. Its `RendererApi` type is the contract the renderer
imports, so a change to the preload surface is a renderer type error.

`src/renderer` is the page: `index.html`, `src/styles.css`, and `src/main.ts`. The starter
shell (tabs, counter, note, settings) is local renderer state; the Home tab also shows the
string returned by the main process over IPC, which is how the process seam shows up on screen.

`src/shared/ipc.ts` holds the IPC channel name so the main and preload sides cannot drift.

`electron.vite.config.ts` keeps electron-vite's defaults except for the build targets, which it
pins to `node24` and `chrome152`. electron-vite 5.0.0 only knows targets up to Electron 39 and
silently falls back to the oldest entry in its table, node16 and chrome108, for anything newer.
Update those two values when you change the Electron major.

`tsconfig.node.json` covers the main and preload processes, `tsconfig.web.json` covers the
renderer, and `tsconfig.json` only references the two.

## Notes

The package stays CommonJS on purpose. With `"type": "module"` electron-vite emits `.mjs`
bundles, and Electron does not load an ESM preload script while the sandbox is on.

Dependencies are installed with npm rather than Bun, so installs follow your npm configuration,
including policies such as `min-release-age` that Bun's installer does not read. Bun is still
the test runner.

The `electron` npm dependency is pinned to the exact version that `pkgs.electron_44` provides, so
the TypeScript definitions match the binary that actually runs. Bump both together.

There is no packaging step. Add `electron-builder` or `@electron-forge/cli` when you need an
installer; nothing in this template assumes either.

No linter is configured. `make lint` is a strict typecheck of both projects, which is the check
that catches the mistakes this layout is prone to.

Rename points when you copy this template: `name` and `description` in `package.json`, the
`title` passed to `BrowserWindow` in `src/main/index.ts`, the `<title>` and `<h1>` in
`src/renderer/index.html`, and `description` in `flake.nix`.
