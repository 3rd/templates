{
  description = "Gio desktop application template";

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
            pkgs.libxcb
            pkgs.libxcursor
            pkgs.libxfixes
            pkgs.libxkbcommon
            pkgs.vulkan-loader
            pkgs.wayland
          ];

          buildOnlyLibraries = pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
            pkgs.libffi
            pkgs.vulkan-headers
            pkgs.wayland-protocols
          ];
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.gnumake
              pkgs.go
              pkgs.pkg-config
            ];

            buildInputs = graphicsLibraries ++ buildOnlyLibraries;

            CGO_ENABLED = "1";

            LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath graphicsLibraries;
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
