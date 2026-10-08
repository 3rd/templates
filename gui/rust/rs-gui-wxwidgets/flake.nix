{
  description = "Rust desktop application built on wxWidgets through wxDragon";

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
            packages = with pkgs; [
              cargo
              cargo-watch
              clippy
              cmake
              gnumake
              pkg-config
              rustc
              rustfmt
            ];

            buildInputs = with pkgs; [
              gtk3
              libglvnd
              libxkbcommon
              libxtst
              openssl
              wayland-scanner
            ];

            WXWIDGETS_DIR = pkgs.wxwidgets_3_3.src;

            LIBCLANG_PATH = "${pkgs.libclang.lib}/lib";
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
