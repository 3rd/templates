# rs-gui-floem

A desktop application template built on Floem, a native Rust UI library with fine-grained
reactivity in the style of Leptos signals.

## Setup

```bash
nix develop
```

The dev shell provides the Rust toolchain from nixpkgs plus the system libraries winit and wgpu
need on Linux: Vulkan, Wayland, X11 and libxkbcommon, with fontconfig for font discovery. Those
are guarded on `stdenv.hostPlatform.isLinux`, so the shell still evaluates on macOS, where winit
uses AppKit and wgpu uses Metal.

Run the app from inside the dev shell. Wayland, libxkbcommon and the Vulkan loader are loaded by
name at run time and are found through the `LD_LIBRARY_PATH` the shell sets, so the binary
started outside it panics with `XKBNotFound`. Ship a released build with an rpath instead of
relying on that variable.

## Commands

```bash
make help      # list targets
make build     # cargo build
make run       # cargo run
make dev       # cargo watch -x run
make test      # cargo test
make lint      # cargo clippy --all-targets -- --deny warnings
make fmt       # cargo fmt
make clean     # cargo clean
make verify    # lint, test and build
```

## Structure

`src/main.rs` holds the whole demo. Tab, count, note, and settings are `RwSignal`s, Floem's
reactive cells. Label closures read those signals, which subscribes the labels to them, so a
button's `count += 1` updates only the dependent labels rather than re-running a view function.
The view tree itself is built once; reactivity happens inside it.

`main` uses `Application::new().window(...)` rather than the shorter `floem::launch`, because
that is where `WindowConfig` sets the window title.

## Notes

Floem is pinned to 0.2.0 from crates.io. It is pre-1.0 and the project states it makes
occasional breaking changes, so check the changelog before bumping.

Rendering goes through wgpu with a tiny-skia CPU fallback, so it still starts on a machine with
no GPU driver, just more slowly.

Rename points: the `name` in `Cargo.toml`, the `APP_NAME` constant in `src/main.rs` (it is both
the window title and the heading), and the `description` in `flake.nix`.
