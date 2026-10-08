{
  description = "Slint desktop application template driven from TypeScript";

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
          slintLibraries = [
            pkgs.fontconfig
            pkgs.freetype
            pkgs.libgbm
            pkgs.libglvnd
            pkgs.libinput
            pkgs.libx11
            pkgs.libxcursor
            pkgs.libxi
            pkgs.libxkbcommon
            pkgs.stdenv.cc.cc.lib
            pkgs.udev
            pkgs.wayland
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
              ];
            }
            // pkgs.lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
              LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath slintLibraries;
            }
          );
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
