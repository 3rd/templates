{
  description = "Qt 6 desktop application template built on the MIQT Go bindings";

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
          default = pkgs.mkShell {
            packages = [
              pkgs.gnumake
              pkgs.go
              pkgs.pkg-config
            ];

            buildInputs = [ pkgs.qt6.qtbase ];

            CGO_ENABLED = "1";
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
