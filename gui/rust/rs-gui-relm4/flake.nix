{
  description = "A Relm4 desktop application starter on top of GTK4";

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
          packages =
            with packagesFor.${system};
            [
              cargo
              cargo-watch
              rustc
              clippy
              rustfmt
              rust-analyzer
              gnumake
              nixfmt
              pkg-config
            ]
            ++ lib.optionals stdenv.hostPlatform.isLinux [ xvfb-run ];

          buildInputs = with packagesFor.${system}; [
            gtk4
            glib
            gdk-pixbuf
            graphene
            pango
            cairo
            harfbuzz
          ];
        };
      });

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
