# rs-gui-fltk

A Rust desktop application template using [fltk-rs](https://github.com/fltk-rs/fltk-rs), safe bindings to the FLTK 1.4 C++ toolkit.

## Setup

```bash
nix develop
```

The dev shell provides the Rust toolchain and the FLTK 1.4 development package. Nothing else needs to be installed.

## Commands

```bash
make help     # list targets
make dev      # cargo watch -x run
make run      # run a release build
make build    # build a release binary
make test     # cargo test
make lint     # cargo clippy, warnings denied
make fmt      # cargo fmt
make clean    # cargo clean
make verify   # lint, test, build
```

## Structure

- `src/main.rs` - the whole application: a window, a header, FLTK `Tabs` for Home/Notes/Settings, working controls, and a status line.
- `Cargo.toml` - pins `fltk` 1.5.23 with the `fltk-config` feature.
- `flake.nix` - dev shell with `cargo`, `rustc`, `clippy`, `rustfmt`, `gnumake`, and `fltk_1_4`.

## Notes

By default fltk-rs compiles FLTK and its `cfltk` C wrapper from sources vendored in the `fltk-sys` crate, which needs CMake and takes several minutes. This template instead enables the `fltk-config` feature, so `fltk-sys` compiles only the small `cfltk` wrapper and links against the FLTK the dev shell provides. That feature requires a real FLTK 1.4 installation with a working `fltk-config` on `PATH`; if you copy this template somewhere without Nix, either install FLTK 1.4 or drop the feature and let the crate build its own copy.

The linked FLTK is built with both the X11 and Wayland backends. FLTK picks one at runtime and falls back to X11 when no Wayland compositor is present.

Rename points: the folder name, `name` in `Cargo.toml`, and the `TITLE` constant in `src/main.rs`, which supplies both the window title and the heading.
