{
  description = "NodeGui desktop application template driving Qt 6 widgets from TypeScript";

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
          qtLibraries = [
            pkgs.dbus
            pkgs.fontconfig
            pkgs.freetype
            pkgs.glib
            pkgs.libglvnd
            pkgs.libx11
            pkgs.libxcb
            pkgs.libxcb-cursor
            pkgs.libxcb-image
            pkgs.libxcb-keysyms
            pkgs.libxcb-render-util
            pkgs.libxcb-util
            pkgs.libxcb-wm
            pkgs.libxkbcommon
            pkgs.stdenv.cc.cc.lib
            pkgs.wayland
            pkgs.zlib
            pkgs.zstd
          ];
        in
        {
          default = pkgs.mkShellNoCC (
            {
              packages = [
                pkgs.bun
                pkgs.gnumake
                pkgs.nixfmt
                pkgs.nodejs_24
                pkgs.watchexec
              ]
              ++ pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
                pkgs.p7zip
                pkgs.patchelf
              ];
            }
            // pkgs.lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
              LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath qtLibraries;

              NIX_DYNAMIC_LINKER = pkgs.stdenv.cc.bintools.dynamicLinker;

              USE_SYSTEM_7ZA = "true";
            }
          );
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
