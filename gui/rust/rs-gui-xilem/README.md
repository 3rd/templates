# rs-gui-xilem

A desktop application template built on Xilem, the Linebender reactive UI architecture that sits
on top of the Masonry widget toolkit.

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
started outside it fails to reach a display. Ship a released build with an rpath instead of
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

`src/main.rs` holds the whole demo. Application state is a plain Rust struct, `Workspace`.
`app_logic` maps that state to a view tree; it re-runs after every event, and Xilem diffs the
returned views against the previous ones to work out the minimal Masonry widget updates. The
button callback receives `&mut Workspace` directly, so incrementing a field is the whole update
path. `Xilem::new_simple` ties state, view function and one window together.

The `+ use<>` in the return type of `app_logic` is edition 2024 precise capturing. Xilem uses it
throughout to keep the returned view from capturing the state borrow.

## Notes

Xilem is pinned to 0.4.0 from crates.io and is explicitly alpha software: the view API changes
between releases, so read the examples for the tag you depend on rather than the ones on `main`.

The crate requires edition 2024, so Rust 1.85 or newer. The nixpkgs toolchain is well past that.

Rendering goes through Vello on wgpu, which needs a working Vulkan driver on Linux. A machine
with no Vulkan driver will build fine but fail at startup.

Rename points: the `name` in `Cargo.toml`, the `APP_NAME` constant in `src/main.rs` (it is both
the window title and the heading), and the `description` in `flake.nix`.
