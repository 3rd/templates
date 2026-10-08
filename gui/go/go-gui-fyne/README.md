# go-gui-fyne

A desktop application template built on Fyne 2.8, a pure-Go widget toolkit that draws its own
widgets through OpenGL and ships a headless driver for tests.

## Setup

```bash
nix develop
```

The dev shell carries the Go toolchain and the X11, OpenGL and xkb libraries that glfw needs,
so nothing has to be installed on the host.

Entering the shell first is optional. Run `make build` from a plain shell and the Makefile
re-enters `nix develop` for you, so nix is the only thing you need installed. Until git tracks
`flake.nix` and `flake.lock`, it addresses the flake as `path:`, so the template does not have to
live in a git repository either. Once both are tracked, nix copies only the files git knows about,
which keeps ignored build output such as `bin/` out of the nix store.

## Commands

Run `make help` for the list. The targets are `dev`, `run`, `build`, `test`, `lint`, `fmt`,
`clean` and `verify`. `build` writes the binary to `bin/go-gui-fyne`, `lint` is `go vet`, and
`verify` runs lint, test and build together. Fyne has no watch mode, so `dev` is `run`.

## Structure

`main.go` holds everything: `newWorkspace` builds a header, AppTabs for Home/Notes/Settings,
working controls, and a status line. `main` creates the app and a resizable window.
`main_test.go` drives the increment button through Fyne's test driver, which
needs no display server.

## Notes

State is ordinary Go variables captured by widget handlers, which call `SetText` on labels.
Fyne also offers `data/binding` for two-way bindings; this template stays with handlers because
each control has a single writer.

Building is verified on Linux only. The macOS shell drops the X11 and OpenGL packages because
glfw links the system frameworks there, but that path has not been built.

To rename the template, change the module path in `go.mod`, the imports that use it, the
`appName` constant in `main.go`, `APP` in the `Makefile`, and the flake description.
