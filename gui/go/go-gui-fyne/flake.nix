{
  description = "Fyne desktop application template";

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

          graphicsLibraries = pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
            pkgs.libglvnd
            pkgs.libx11
            pkgs.libxcursor
            pkgs.libxi
            pkgs.libxinerama
            pkgs.libxkbcommon
            pkgs.libxrandr
            pkgs.libxxf86vm
            pkgs.wayland
          ];
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.gnumake
              pkgs.go
              pkgs.pkg-config
            ];

            buildInputs = graphicsLibraries;

            CGO_ENABLED = "1";

            LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath graphicsLibraries;
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
