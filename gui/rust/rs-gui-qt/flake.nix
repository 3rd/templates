{
  description = "Rust desktop application built on Qt 6 and QML through CXX-Qt";

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
          qt = pkgs.qt6.env "qt6-cxx-qt" [ pkgs.qt6.qtdeclarative ];
        in
        {
          default = pkgs.mkShell {
            packages =
              with pkgs;
              [
                cargo
                cargo-watch
                clippy
                gnumake
                rustc
                rustfmt
              ]
              ++ [ qt ];

            buildInputs = [ pkgs.libglvnd ];

            QMAKE = "${qt}/bin/qmake";
            QT_PLUGIN_PATH = "${qt}/lib/qt-6/plugins";
            QML2_IMPORT_PATH = "${qt}/lib/qt-6/qml";
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
