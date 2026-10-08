# rs-gui-iced

A minimal desktop application built with `iced`, a retained-mode Rust GUI library that follows
the Elm architecture: state, a `Message` enum, an `update` that changes state, and a `view` that
turns state into widgets.

## Setup

```bash
nix develop
```

The dev shell provides `cargo`, `rustc`, `clippy`, `rustfmt`, `make`, and the system libraries
that `winit` and `wgpu` open at run time.

## Commands

```bash
make help     # list targets
make build    # cargo build
make run      # cargo run
make dev      # cargo watch -x run
make test     # cargo test
make lint     # cargo clippy --all-targets -- --deny warnings
make fmt      # cargo fmt
make clean    # cargo clean
make verify   # lint, test, build
```

## Structure

`src/main.rs` holds everything. `main` wires the three pieces together with
`iced::application(boot, update, view)` and sets the window title on the returned builder.
`Workspace` is the state (tabs, counter, note, settings), `Message` is the closed set
of things that can happen, `update` is the only place state changes, and `view` is a pure
function from state to widgets. The button does not mutate anything; `on_press` attaches a
`Message` that the runtime feeds back into `update`, which is the seam that separates this
from an immediate-mode toolkit.

## Notes

`winit` and the `wgpu` backends load their graphics and windowing libraries with `dlopen` rather
than linking them, so a binary built here will not start unless `libGL`, `libxkbcommon`,
`vulkan-loader`, `wayland`, and the X11 client libraries are reachable at run time. Inside
`nix develop` the shell's `LD_LIBRARY_PATH` covers this. Outside nix, install those libraries
through the system package manager; on most distributions they arrive with any other desktop
application. Running the binary from a plain `nix build` result without that library path will
fail at startup with a missing-library or "no suitable graphics adapter" error.

The window needs a display. Over SSH without X forwarding or a Wayland socket, `make build`
still succeeds but `make run` cannot open a window.

`iced` renders through `wgpu` and falls back to the CPU-side `tiny-skia` renderer when no
adapter is available. Setting `ICED_BACKEND=tiny-skia` forces the fallback, which is useful when
debugging a machine whose Vulkan setup is broken.

`iced` is explicit that it expects comfort with Rust lifetimes and closures; `view` returns an
`Element<'_, Message>` borrowed from the state, and that borrow shapes how larger applications
are structured.

To rename the project, change `name` in `Cargo.toml`, the `APP_NAME` constant in `src/main.rs`,
the `description` in `flake.nix`, and this file's title. `APP_NAME` is used for both the window
title and the heading.

The template does not set `iced::Settings::id`, so the window carries no application id and
desktop environments will not group it or match a `.desktop` entry. Set it through
`.settings(iced::Settings { id: Some(APP_NAME.to_owned()), ..Default::default() })` when the
project needs real desktop integration.
