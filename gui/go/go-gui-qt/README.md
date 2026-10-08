# go-gui-qt

A desktop application template built on Qt 6 Widgets through MIQT 0.14, MIT-licensed Go bindings
that call Qt's C++ API over cgo. The window is made of native Qt widgets: a main window, a tab
widget, line edits, a checkbox, and push buttons.

## Setup

```bash
nix develop
```

The dev shell carries the Go toolchain, pkg-config, and Qt 6 from nixpkgs, so nothing has to be
installed on the host. MIQT finds Qt through pkg-config, so the app builds and runs against that
one Qt.

Entering the shell first is optional. Run `make build` from a plain shell and the Makefile
re-enters `nix develop` for you, so nix is the only thing you need installed. Until git tracks
`flake.nix` and `flake.lock`, it addresses the flake as `path:`, so the template does not have to
live in a git repository either. Once both are tracked, nix copies only the files git knows about,
which keeps ignored build output such as `bin/` out of the nix store.

## Commands

Run `make help` for the list. The targets are `dev`, `run`, `build`, `test`, `lint`, `fmt`,
`clean` and `verify`. `build` writes the binary to `bin/go-gui-qt`, `run` builds and then
starts it, `lint` is `go vet`, and `verify` runs lint, test and build together. Qt has no watch
mode, so `dev` is `run`.

The first build compiles MIQT's C++ side for every Qt class it binds, which took about ten
minutes here. Go caches the result, so later builds, tests, and runs take seconds.

## Structure

`main.go` holds everything. `newWorkspace` builds a header, a `QTabWidget` with the
Home/Notes/Settings pages, working controls, and a status line, and `main` puts it in a
resizable `QMainWindow` and runs Qt's event loop. `main_test.go` drives the real widgets on
Qt's offscreen platform, so it needs no display server.

## Notes

State is ordinary Go variables captured by the signal handlers, which call `SetText` on labels;
`formatStatus` derives the status line from them. Apply writes the saved message straight to the
status line, and the next handler that refreshes it replaces the message.

Qt widgets belong to the thread that runs Qt's event loop. `init` locks the main goroutine to the
process main thread, and `main_test.go` keeps that thread for `QApplication_Exec`, runs the tests
on a goroutine, and reaches the widgets through `mainthread.Wait`. Code you add that touches
widgets from a goroutine has to do the same.

Widgets are styled with a style sheet each rather than one window style sheet with
`#objectName` selectors. In MIQT 0.14, `NewQAnyStringView2` and `NewQAnyStringView3` build the
view over a temporary `QByteArray` or `QString` that is freed before they return, so passing
their result to `SetObjectName`, or to any other method that takes a `QAnyStringView`, hands Qt
a dangling view. That comes from reading MIQT's generated code, not from an observed crash;
avoid those methods until MIQT fixes the constructors.

The app takes the desktop's look. nixpkgs' Qt also loads platform theme and style plugins from
your Nix profiles, so a NixOS desktop configured with qt6ct and Kvantum gets that theme, and
without one Qt uses Fusion. The style sheets color the header, badge, and status line with
`palette(...)` roles rather than fixed colors, so they follow light and dark themes alike.

MIQT is young: it started in August 2024, and its README says the bindings may be immature in
places. `go.mod` pins v0.14.0.

MIQT is MIT-licensed. Qt is used under the LGPLv3, which a closed-source, paid app can satisfy
when Qt stays in separate shared libraries that users can replace, the app ships Qt's license
text along with Qt's source or a written offer for it, and the app's terms do not forbid
replacing Qt or reverse engineering to debug such a replacement. An app that cannot meet those
conditions needs a commercial Qt license.

Verified on NixOS x86_64: `make verify`, and `make run` under Xvfb with every control driven
under a Kvantum dark theme, the first screen under plain Fusion, and stops on window close and
on Ctrl-C. The flake also declares the macOS and aarch64-linux shells, but those paths have not
been built, and a Wayland session has not been tried.

To rename the template, change the module path in `go.mod`, the `appName` constant in
`main.go`, `APP` in the `Makefile`, and the flake description.
