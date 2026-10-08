# rs-gui-makepad

A desktop application template built on Makepad, which describes its UI in a live-reloadable DSL
rather than in Rust code.

## Setup

```bash
nix develop
```

The dev shell provides the Rust toolchain from nixpkgs plus the libraries Makepad links by name
on Linux: X11 and Xcursor for windowing, libglvnd for GLX and EGL, alsa-lib and libpulseaudio for
audio. Those are guarded on `stdenv.hostPlatform.isLinux`, so the shell still evaluates on macOS,
where Makepad uses Cocoa and Metal.

Run the app from inside the dev shell, which puts those libraries on `LD_LIBRARY_PATH`.

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

`src/main.rs` holds the whole demo, and it is split in two halves that talk to each other by name.

The `live_design!` block is Makepad's DSL. It declares the widget tree, including the window title,
the Home/Notes/Settings views, and ids the Rust side needs to reach (`counter_label`,
`increment_button`, `note_input`, and the rest). `App = {{App}}` binds that DSL node to the Rust
struct below it.

The Rust half is the struct plus three impls. `#[live]` fields are filled in from the DSL,
`#[rust]` fields are ordinary state. `MatchEvent::handle_actions` is where the button click is
picked up, via `self.ui.button(id!(increment_button)).clicked(actions)`, and the label is updated
by id. `app_main!` generates the entry point that `main` calls.

Widgets are addressed by id through `id!()` rather than held as Rust references, so adding a
widget means naming it in the DSL and looking it up where you need it.

## Notes

Makepad is pinned to `makepad-widgets` 1.0.0 from crates.io.

The Linux backend is X11 only in this release; there is no native Wayland backend, so under a
Wayland compositor the app runs through XWayland.

Makepad also ships its own build tooling (`cargo makepad`) for mobile and WebAssembly targets.
This template deliberately stays a plain cargo project for the desktop case.

Rename points: the `name` in `Cargo.toml`, the window `title` and the heading `<Label>` text in
the `live_design!` block in `src/main.rs`, and the `description` in `flake.nix`.
