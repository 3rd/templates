# rs-gui-freya

Desktop application template built with Freya, a declarative Rust GUI library that renders
through Skia and runs on `dioxus-core` and `winit`.

## Setup

```sh
nix develop
```

The dev shell provides the Rust toolchain, `pkg-config`, the font stack, and the GL, Vulkan,
Wayland, and X11 libraries Skia and winit need at both link and run time.

Entering the shell first is optional. Run any `make` target from a plain shell and it re-enters
the dev shell on its own. Nix is the only thing that has to be installed, and the template does
not have to live in a git repository.

## Commands

```sh
make help
make dev      # cargo watch -x run
make run      # release build, run directly
make build    # release build
make test     # cargo test
make lint     # cargo clippy with warnings denied
make fmt      # cargo fmt
make clean    # cargo clean
make verify   # lint, test, build
```

## Structure

- `src/main.rs` holds `main`, the window configuration, and the `app` component.
- `Cargo.toml` pins `freya`.
- `flake.nix` defines the dev shell.

## Notes

- Rename points: the `name` in `Cargo.toml`, the window title and heading in `src/main.rs`,
  the title of this README, and the `description` in `flake.nix`.
- Freya builds the `freya-skia-safe` bindings, which download a prebuilt Skia archive on the
  first build. That first build needs network access and takes a few minutes.
- `LD_LIBRARY_PATH` in `flake.nix` is required, not decorative. Skia and winit `dlopen`
  `libGL`, `libxkbcommon`, Wayland, and Vulkan at startup, so a link-time-only dependency
  would still fail when the binary runs.
- The pinned release is the latest stable line. Freya also publishes `0.5.0-rc` prereleases
  whose builder API differs.
