# go-gui-gio

A desktop application template built on Gio 0.10, an immediate-mode Go UI library that renders
through Vulkan, OpenGL or Metal and lays out the whole window on every frame.

## Setup

```bash
nix develop
```

The dev shell carries the Go toolchain plus the X11, Wayland, EGL and Vulkan libraries Gio
needs, so nothing has to be installed on the host.

Entering the shell first is optional. Run `make build` from a plain shell and the Makefile
re-enters `nix develop` for you, so nix is the only thing you need installed. Until git tracks
`flake.nix` and `flake.lock`, it addresses the flake as `path:`, so the template does not have to
live in a git repository either. Once both are tracked, nix copies only the files git knows about,
which keeps ignored build output such as `bin/` out of the nix store.

## Commands

Run `make help` for the list. The targets are `dev`, `run`, `build`, `test`, `lint`, `fmt`,
`clean` and `verify`. `build` writes the binary to `bin/go-gui-gio`, `lint` is `go vet`, and
`verify` runs lint, test and build together. Gio has no watch mode, so `dev` is `run`.

## Structure

`main.go` holds everything. `workspaceUI` owns the theme, tab buttons, editors, and count;
its `layout` method reads clicks and redraws the frame. `run` is the event loop over
`window.Event()`, and `main` starts it on its own goroutine because `app.Main()` has to own the
main thread. `main_test.go` lays out frames against a synthetic `layout.Context`, so it needs
no display server.

## Notes

Gio is immediate mode: there is no retained widget tree and no event callback. The button state
lives in `widget.Clickable`, and `Clicked(gtx)` reports a click while the frame is being built.
A frame therefore has to be laid out for a click to be observed, which is why the test lays out
twice.

`vulkan-loader` ships no headers, so the shell also carries `vulkan-headers`; without it cgo
fails on `vulkan/vulkan.h`.

Building is verified on Linux only. The macOS shell drops the Linux graphics packages because
Gio uses Metal and CoreGraphics there, but that path has not been built.

To rename the template, change the module path in `go.mod`, the `appName` constant in
`main.go`, `APP` in the `Makefile`, and the flake description.
