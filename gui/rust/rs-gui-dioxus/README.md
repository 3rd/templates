# rs-gui-dioxus

Desktop application template built with Dioxus and its webview desktop renderer, which draws the
UI with `wry` and `tao`.

## Setup

```sh
nix develop
```

The dev shell provides the Rust toolchain, the `dx` CLI, `pkg-config`, and the GTK, WebKitGTK,
and libsoup libraries `wry` needs. No `cargo install` step is required.

Entering the shell first is optional. Run any `make` target from a plain shell and it re-enters
the dev shell on its own. Nix is the only thing that has to be installed, and the template does
not have to live in a git repository.

## Commands

```sh
make help
make dev      # dx serve, watch and hot reload
make run      # release build, run directly
make build    # release build
make test     # cargo test
make lint     # cargo clippy with warnings denied
make fmt      # cargo fmt
make clean    # cargo clean
make verify   # lint, test, build
```

`make build` and `make run` use plain cargo, so the `desktop` feature is selected in
`Cargo.toml` rather than by the CLI. `make dev` is `dx serve --platform desktop`.

## Structure

- `src/main.rs` holds `main`, the window configuration, and the `app` component.
- `Cargo.toml` pins `dioxus` with the `desktop` feature.
- `flake.nix` defines the dev shell.

## Notes

- Rename points: the `name` in `Cargo.toml`, the window title and heading in `src/main.rs`,
  the title of this README, and the `description` in `flake.nix`.
- `dioxus-desktop` depends on `tray-icon`, which links against `libxdo`. That is why `xdotool`
  is in the dev shell even though this app has no tray icon.
- `LD_LIBRARY_PATH` in `flake.nix` is required, not decorative. WebKitGTK launches a separate
  web process and loads its GL stack at run time, so link-time paths alone are not enough.
- On Linux the app needs WebKitGTK 4.1 at run time. On macOS and Windows the system webview is
  used instead.
