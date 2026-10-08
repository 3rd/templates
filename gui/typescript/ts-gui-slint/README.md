# ts-gui-slint

Slint desktop application starter. The window is declared in Slint markup and compiled at
runtime by the `slint-ui` package; the application process is TypeScript run by Node 24. Slint
draws its own widgets, so there is no webview and no bundled browser.

## Setup

Nix is the only requirement. Every `make` target re-enters the dev shell on its own, so

```bash
make build
```

works from a plain shell, and the project does not have to live in a git repository. Run
`nix develop` yourself when you want an interactive shell; targets invoked from inside it skip
the re-entry.

The dev shell provides Node 24, npm, Bun, GNU make, and nixfmt. On Linux it also sets
`LD_LIBRARY_PATH` to the shared libraries the prebuilt `slint-ui` addon needs: fontconfig,
FreeType, libgbm, libinput, libudev, libxkbcommon, and libstdc++, which it links against, plus
libX11, libXcursor, libXi, Wayland, and libglvnd, which its windowing and OpenGL code opens at
runtime.

## Commands

```bash
make help     # list commands
make dev      # run the app, restarting on changes in src/ and ui/
make run      # run the app
make build    # compile ui/app-window.slint without opening a window
make test     # bun test
make lint     # typecheck the sources
make fmt      # prettier over the sources, nixfmt over flake.nix
make clean    # remove node_modules/
make verify   # lint, test, build
```

Every target installs dependencies first through `npm ci` when `node_modules` is missing or
stale.

## Structure

`ui/app-window.slint` is the interface: the `AppWindow` component with the header, a
`TabWidget` holding the Home, Notes, and Settings tabs, and the status line, built from
`std-widgets.slint`. The starter state (count, note, notifications, display name, and the
transient `Saved as` message) lives in Slint properties, and the markup derives the status line
from them.

The note's character count is the one rule the markup cannot express. Slint's
`string.character-count` counts grapheme clusters, so `e` followed by a combining accent is one
character there, while the status line counts code points. `AppWindow` declares a
`pure callback count-characters`, and TypeScript implements it with `countCharacters` from
`src/characters.ts`. `src/characters.test.ts` covers that function.

`src/app-window.ts` is the typed boundary. `slint-ui` types `loadFile` as returning `Object` and
every property of a component instance as `unknown`, so the module checks that `AppWindow` is a
function and that the instance has `run()` before handing typed values on.
`AppWindowProperties` mirrors the callback declared in the markup; nothing generates it, so keep
the two in step by hand.

`src/main.ts` is the application process: it creates the window with the TypeScript callback
attached and runs Slint's event loop until the window closes.

`src/compile-ui.ts` is what `make build` runs. It compiles the markup through the same
`loadFile` call the app uses, without creating a window, so a markup error fails the build.
There is no other build output: Node runs the TypeScript sources directly through its built-in
type stripping, which is why imports carry `.ts` extensions and `tsconfig.json` enables
`erasableSyntaxOnly`.

## Notes

Node runs the app, not Bun. Slint's event loop integration calls libuv's `uv_backend_fd`, which
Bun does not implement, and Bun 1.3.13 (the dev shell's) and 1.4.0 both crash when the event
loop starts. Under Node the same integration idles at 0% CPU. Bun is still the test runner,
because the tests do not load the addon.

Dependencies are installed with npm rather than Bun, so installs follow your npm configuration,
including policies such as `min-release-age` that Bun's installer does not read.

`slint-ui` is pinned to 1.18.1, the current release; 1.19 exists only as nightly builds. The
package pulls a prebuilt N-API binary for your platform as an optional dependency, so no Rust
toolchain is needed. Upstream still marks the Node binding as beta, so expect API changes
between minor releases.

`make fmt` leaves `.slint` files alone, because Prettier has no Slint parser.

`src/app-window.ts` passes `{ quiet: false }` to `loadFile` even though that is the documented
default: `slint-ui` prints compiler warnings only when an options object is present.

Outside the dev shell, `node src/main.ts` fails with `Cannot find native binding`. The
underlying cause, printed further down, is a missing shared library such as
`libxkbcommon.so.0`.

Slint picks its windowing backend at startup. With a display server it uses winit; without
one, or when its X11 libraries fail to load, it falls back to its linuxkms backend, which draws
straight to the GPU. That fallback is also why there is no widget-level test: the
release binary has no headless backend, so a test that creates `AppWindow` would need a
display server.

When EGL is unavailable, as on Xvfb, Slint prints two `Failed to initialize Skia ... surface`
lines and falls back to its software renderer; the window works either way.

Slint is used under its Royalty-free License, which covers proprietary desktop applications on
the condition that you disclose the use, for example with the `AboutSlint` widget in an About
screen or the Slint badge on a download page; this starter shows neither. GPLv3 is the
alternative for open source applications, and embedded systems need the paid Commercial
license.

Verified on NixOS x86_64: `make verify`, `make dev`, and `make run`, with the starter shell
driven under Xvfb (X11). The window also opened under a headless Weston compositor (Wayland).
The GPU-backed OpenGL renderer and the `aarch64-darwin` and `aarch64-linux` shells were not
exercised.

Rename points when you copy this template: `name` and `description` in `package.json`, the
window `title`, the header text, and the default `display-name` in `ui/app-window.slint`, and
`description` in `flake.nix`.
