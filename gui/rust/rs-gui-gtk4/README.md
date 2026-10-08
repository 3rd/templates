# rs-gui-gtk4

A Rust desktop application starter built directly on the GTK4 bindings (`gtk4-rs`): an `Application`, an `ApplicationWindow`, and widgets wired together with GObject signals.

## Setup

```bash
nix develop
make build
```

The dev shell carries the Rust toolchain, `pkg-config`, and the GTK4 system libraries, so nothing else needs to be installed.

You can also skip the first step. Run `make build` from a plain shell and it re-enters the dev shell for you, so nix is the only thing you need installed. The template does not have to live in a git repository.

## Commands

```bash
make help     # list commands
make run      # build and run the app
make dev      # cargo watch -x run
make build    # build the app
make test     # run tests
make lint     # cargo clippy with warnings denied
make fmt      # cargo fmt
make clean    # remove build output
make verify   # lint, test, build
```

## Structure

- `src/main.rs` - the whole application: `main` builds a `gtk4::Application`, `build_content` constructs a header, a `Notebook` with Home/Notes/Settings, and a status line, and `build_window` puts it in an `ApplicationWindow`. The increment button mutates a `Cell<u32>` from its `connect_clicked` handler and pushes the new text into the counter `Label`. The tests at the bottom build the content and drive the button with `emit_clicked`, so the counter is covered without a window ever being shown.
- `Cargo.toml` - the crate, named after this folder.
- `flake.nix` - the dev shell.
- `Makefile` - the commands above.

## Notes

- Rename points: the folder name, the `name` in `Cargo.toml`, and `APP_ID` plus `APP_NAME` in `src/main.rs`. `APP_ID` is a D-Bus-style application ID and must stay in reverse-domain form.
- This template is plain GTK4. It does not use libadwaita, which would add the GNOME-specific widget set, an extra system dependency, and `adw::Application` in place of `gtk4::Application`. Add `libadwaita` to `Cargo.toml` and to the flake's `buildInputs` if you want it.
- GTK4 also runs on macOS through its quartz backend, but only the Linux build is exercised here.
- Running headless needs a display server. Under Xvfb, set `GSK_RENDERER=cairo` to avoid the GL renderer.
- `make test` constructs real GTK widgets, so it needs a display even though it shows no window. Without one, `gtk4::init` fails and the widget test says so.
- On a headless Linux machine, run `xvfb-run make test` from inside `nix develop`, or `nix develop -c xvfb-run make test` from a plain shell. `xvfb-run` comes from the dev shell, so it has to be the shell that supplies it: plain `xvfb-run make test` from outside fails with "command not found" before make can re-enter anything.
- Neither applies on macOS, where GTK uses the quartz backend rather than an X display, so the shell does not ship `xvfb-run` there.
- For an Elm-style architecture on the same widgets, see the `rs-gui-relm4` template.
