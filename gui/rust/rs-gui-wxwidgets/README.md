# rs-gui-wxwidgets

A Rust desktop application template using [wxDragon](https://github.com/AllenDang/wxdragon), safe bindings to the wxWidgets 3.3 C++ toolkit.

## Setup

```bash
nix develop
```

The dev shell provides the Rust toolchain, CMake, GTK 3, and the wxWidgets sources that wxDragon compiles. Nothing else needs to be installed.

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

- `src/main.rs` - the whole application: a frame, a header, a `Notebook` with Home/Notes/Settings, working controls, and a status line.
- `Cargo.toml` - pins `wxdragon` 0.9.21. No wxDragon features are enabled, which keeps AUI, XRC, StyledTextCtrl, RichText, WebView, and MediaCtrl out of the wxWidgets build.
- `flake.nix` - dev shell with the Rust toolchain, CMake, GTK 3, and the build inputs wxWidgets links against.

## Notes

wxDragon does not link a prebuilt wxWidgets. Its `wxdragon-sys` crate compiles wxWidgets from source with CMake and links it statically, and by default it downloads the matching source release during the build. This template sets `WXWIDGETS_DIR` to the wxWidgets sources from nixpkgs instead, which happen to be exactly the 3.3.3 release wxDragon expects, so the build needs no network and is pinned by `flake.lock`.

The first build is therefore long - it compiles all of wxWidgets plus wxDragon's C++ wrapper, several minutes on a warm machine - and it happens once per cargo profile, so a debug and a release build pay the cost separately. The output lands under the cargo target directory, not in this folder.

Two things the wxWidgets CMake build needs that are easy to miss on a system without them: `wayland-scanner`, which it finds through pkg-config and uses to generate Wayland protocol headers during configure, and `libxkbcommon` and `libXtst` at link time. Without `wayland-scanner` the configure step silently skips header generation and the build fails later in `src/gtk/app.cpp`.

`wxdragon-sys` pulls in `reqwest` and therefore `openssl-sys` for its source downloader, so OpenSSL must be present even when the download is bypassed.

Verified on Linux with the GTK 3 backend. The flake also declares `aarch64-darwin`, where wxWidgets builds against Cocoa; that path was not exercised here.

Rename points: the folder name, `name` in `Cargo.toml`, and the `TITLE` constant in `src/main.rs`, which supplies both the frame title and the heading.
