# rs-gui-zed-gpui

A desktop application template built on GPUI, the GPU-accelerated UI framework that Zed is written in.

## Setup

```bash
nix develop
```

The dev shell provides the Rust toolchain from nixpkgs plus the system libraries GPUI needs on
Linux: fontconfig and freetype for font loading, Vulkan, Wayland, X11 and libxkbcommon for
windowing and input. Those are guarded on `stdenv.hostPlatform.isLinux`, so the shell still
evaluates on macOS, where GPUI uses CoreText and Metal instead.

Run the app from inside the dev shell. Vulkan, Wayland and libxkbcommon are loaded by name at
run time and are found through the `LD_LIBRARY_PATH` the shell sets, so the binary started
outside it fails with `libvulkan.so.1: cannot open shared object file`. Ship a released build
with an rpath instead of relying on that variable.

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

`src/main.rs` holds the whole demo. `Workspace` is a GPUI model: it owns the Home and Settings
tabs, the counter, and the notification toggle, and implements `Render`, which returns an element
tree built with the `div()` builder. Buttons use `cx.listener` to get a callback with
`&mut Workspace`, mutate state and call `cx.notify()`, which is what schedules a re-render.
`main` starts an `Application`, opens one window through `cx.open_window` and installs the model
as that window's root view.

## Notes

GPUI is published on crates.io as `gpui`, pinned here to 0.2.2. Its default features are
`wayland` and `x11` on Linux, so both display servers work out of the box.

The crate requires edition 2024, so Rust 1.85 or newer. The nixpkgs toolchain is well past that;
no rustup or toolchain override is needed.

Rendering goes through Vulkan on Linux via blade-graphics. A machine with no Vulkan driver will
build fine but fail at window creation.

Rename points: the `name` in `Cargo.toml`, the `APP_NAME` constant in `src/main.rs` (it is both
the window title and the heading), and the `description` in `flake.nix`.
