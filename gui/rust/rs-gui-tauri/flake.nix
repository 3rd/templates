{
  description = "Tauri v2 desktop application template with a React frontend";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      supportedSystems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;
      packagesFor = forAllSystems (system: import nixpkgs { inherit system; });
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = packagesFor.${system};
          inherit (pkgs) lib stdenv;

          webviewLibraries = lib.optionals stdenv.hostPlatform.isLinux (
            with pkgs;
            [
              atkmm
              cairo
              gdk-pixbuf
              glib
              gtk3
              harfbuzz
              libsoup_3
              openssl
              pango
              webkitgtk_4_1
            ]
          );

          runtimeLibraries = lib.optionals stdenv.hostPlatform.isLinux (
            with pkgs;
            [
              libGL
              libxkbcommon
              vulkan-loader
              wayland
            ]
          );
        in
        {
          default = pkgs.mkShell {
            packages =
              (with pkgs; [
                cargo
                cargo-watch
                cargo-tauri
                clippy
                gnumake
                nodejs
                rustc
                rustfmt
              ])
              ++ lib.optionals stdenv.hostPlatform.isLinux (
                with pkgs;
                [
                  gobject-introspection
                  pkg-config
                ]
              );

            buildInputs = webviewLibraries;

            LD_LIBRARY_PATH = lib.makeLibraryPath (webviewLibraries ++ runtimeLibraries);

            WEBKIT_DISABLE_DMABUF_RENDERER = "1";
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
