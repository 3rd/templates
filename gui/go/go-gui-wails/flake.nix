{
  description = "Wails desktop application template with a React frontend";

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

          webviewLibraries = pkgs.lib.optionals pkgs.stdenv.hostPlatform.isLinux [
            pkgs.gtk3
            pkgs.webkitgtk_4_1
          ];
        in
        {
          default = pkgs.mkShell {
            packages = [
              pkgs.gnumake
              pkgs.go
              pkgs.nodejs
              pkgs.pkg-config
              pkgs.wails
            ];

            buildInputs = webviewLibraries;

            CGO_ENABLED = "1";

            LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath webviewLibraries;

            WEBKIT_DISABLE_DMABUF_RENDERER = "1";
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
