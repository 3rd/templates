# rs-gui-egui

A minimal desktop application built with `eframe` and `egui`, the immediate-mode Rust GUI
toolkit. The whole UI is rebuilt from application state on every frame, so there is no widget
tree to keep in sync and no event callbacks.

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

`src/main.rs` holds everything: `main` configures the window through `eframe::NativeOptions`
and `egui::ViewportBuilder`, the `Workspace` struct holds tabs, the counter, the note, and
settings, and its `eframe::App::ui` implementation both draws the widgets and reacts to them.
In immediate mode the button click is read where the button is drawn, from the `Response`
that `ui.button` returns, rather than dispatched to a separate handler.

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

`eframe` 0.36 renders through `wgpu` by default; its older `glow` (OpenGL) backend is behind the
opt-in `glow` feature. Enable that feature and set `NativeOptions::renderer` if you need it.
`libGL` is still in the dev shell because `wgpu` falls back to its GL backend, which opens
`libEGL` at run time, when no Vulkan adapter is available.

To rename the project, change `name` in `Cargo.toml`, the `APP_NAME` constant in
`src/main.rs`, the `description` in `flake.nix`, and this file's title. `APP_NAME` is used for
both the window title and the `eframe` persistence and Wayland application id.
