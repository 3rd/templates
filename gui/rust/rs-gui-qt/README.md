# rs-gui-qt

A Rust desktop application template using [CXX-Qt](https://github.com/KDAB/cxx-qt) to drive a Qt 6 QML interface from a Rust `QObject`.

## Setup

```bash
nix develop
```

The dev shell provides the Rust toolchain and a Qt 6 installation containing QtBase and QtDeclarative. Nothing else needs to be installed.

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

- `src/counter.rs` - the `#[cxx_qt::bridge]` module. `Counter` is a `QObject` with a `count` `Q_PROPERTY` and `increment`/`reset` invokables, registered into QML by `#[qml_element]`.
- `src/main.rs` - starts `QGuiApplication`, loads the QML entry point from the generated Qt resource.
- `qml/main.qml` - the window, tab bar, Home/Notes/Settings pages, and the Home counter bound to the Rust `Counter`.
- `build.rs` - `CxxQtBuilder` declares the QML module URI and the Rust files holding bridges, then generates and compiles the C++ side.
- `flake.nix` - dev shell with `cargo`, `rustc`, `clippy`, `rustfmt`, `gnumake`, a joined Qt 6 prefix, and `libglvnd`.

## Notes

The QML module URI `com.example.rsguiqt` appears in three places that must agree: `build.rs`, the `import` in `qml/main.qml`, and the `qrc:/qt/qml/<uri as a path>/qml/main.qml` URL in `src/main.rs`. QML module URIs cannot contain hyphens, which is why it is not spelled `rs-gui-qt`.

`cxx-qt-build` discovers Qt by running one `qmake` and expects every Qt module's library and `.prl` file to live under the single `QT_INSTALL_LIBS` it reports. nixpkgs ships each Qt module as a separate store path, so the flake builds a joined Qt prefix with `qt6.env` and points `QMAKE` at it. Qt's `.prl` files also request `-lGLX` and `-lOpenGL`, which come from `libglvnd`.

`cxx-qt-build` passes `-fuse-ld=gold` to the linker, so cargo prints a deprecation warning on every link. That is upstream behavior, not a problem with this template.

Verified on Linux. The flake also declares `aarch64-darwin`, where CXX-Qt links Qt as frameworks; that path was not exercised here.

Rename points: the folder name, `name` in `Cargo.toml`, the QML module URI in the three places above, and the `title` and heading text in `qml/main.qml`.
