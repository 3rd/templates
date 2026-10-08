{
  description = "Rust desktop application built on FLTK through fltk-rs";

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
      devShells = forAllSystems (system: {
        default = packagesFor.${system}.mkShell {
          packages = with packagesFor.${system}; [
            cargo
            cargo-watch
            clippy
            fltk_1_4
            gnumake
            rustc
            rustfmt
          ];
        };
      });

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
