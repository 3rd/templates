# rs-gui-relm4

A Rust desktop application starter using Relm4, an Elm-style component layer over GTK4: state lives in a model, input is a message enum, and the widget tree is declared with the `view!` macro.

## Setup

```bash
nix develop
make build
```

The dev shell carries the Rust toolchain, `pkg-config`, and the GTK4 system libraries that Relm4 builds against, so nothing else needs to be installed.

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

- `src/main.rs` - the whole application. `AppModel` holds tabs, the counter, the note, and settings; `AppMsg` lists what can happen; the `view!` macro declares the window and maps `connect_clicked` to a message; `update` applies the message to the model; and the `#[watch]` attribute on the counter label re-reads the model after every update. The tests at the bottom launch the component with `AppModel::builder().launch(0).detach()`, press the real button with `emit_clicked`, drain the main context, and read the label text back, which covers the whole message round trip including the `#[watch]`.
- `Cargo.toml` - the crate, named after this folder. Relm4 pulls in `gtk4`, so there is no separate GTK dependency.
- `flake.nix` - the dev shell.
- `Makefile` - the commands above.

## Notes

- Rename points: the folder name, the `name` in `Cargo.toml`, and `APP_ID` plus `APP_NAME` in `src/main.rs`. `APP_ID` is a D-Bus-style application ID and must stay in reverse-domain form.
- GTK types are reached through the `relm4::gtk` re-export, which keeps the GTK4 version matched to the one Relm4 was built against.
- To grow the app, add variants to `AppMsg` and arms to `update`. A second component becomes its own `SimpleComponent` (or `Component` when it needs async commands), attached with `Controller` from the parent's `init`.
- This template is plain GTK4. Relm4 has an optional `libadwaita` feature that swaps in the GNOME widget set and adds a system dependency; it is left off so the template stays minimal.
- GTK4 also runs on macOS through its quartz backend, but only the Linux build is exercised here.
- Running headless needs a display server. Under Xvfb, set `GSK_RENDERER=cairo` to avoid the GL renderer.
- `make test` constructs real GTK widgets, so it needs a display even though it shows no window. Without one, `gtk::init` fails and the widget test says so.
- On a headless Linux machine, run `xvfb-run make test` from inside `nix develop`, or `nix develop -c xvfb-run make test` from a plain shell. `xvfb-run` comes from the dev shell, so it has to be the shell that supplies it: plain `xvfb-run make test` from outside fails with "command not found" before make can re-enter anything.
- Neither applies on macOS, where GTK uses the quartz backend rather than an X display, so the shell does not ship `xvfb-run` there.
- Forgetting `#[watch]` on a label is the usual Relm4 mistake: the code compiles, the message reaches `update`, and the label never changes. The widget test catches exactly that.
- For the same window built directly against GTK signals, without the component layer, see the `rs-gui-gtk4` template.
