{
  description = "Electron desktop application template built with electron-vite and TypeScript";

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
        in
        {
          default = pkgs.mkShellNoCC {
            packages = [
              pkgs.bun
              pkgs.electron_44
              pkgs.gnumake
              pkgs.nixfmt
              pkgs.nodejs_24
            ];

            ELECTRON_SKIP_BINARY_DOWNLOAD = "1";
            ELECTRON_OVERRIDE_DIST_PATH = "${pkgs.electron_44}/bin";
            ELECTRON_EXEC_PATH = "${pkgs.electron_44}/bin/electron";
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
