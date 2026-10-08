{
  description = "Makepad desktop application template";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs =
    { nixpkgs, ... }:
    let
      inherit (nixpkgs) lib;
      supportedSystems = [
        "aarch64-darwin"
        "aarch64-linux"
        "x86_64-linux"
      ];
      forAllSystems = lib.genAttrs supportedSystems;
      packagesFor = forAllSystems (system: import nixpkgs { inherit system; });
    in
    {
      devShells = forAllSystems (
        system:
        let
          pkgs = packagesFor.${system};
          systemLibraries = lib.optionals pkgs.stdenv.hostPlatform.isLinux (
            with pkgs;
            [
              alsa-lib
              libglvnd
              libpulseaudio
              libx11
              libxcursor
            ]
          );
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              cargo
              cargo-watch
              clippy
              gnumake
              rust-analyzer
              rustc
              rustfmt
            ];

            buildInputs = systemLibraries;

            LD_LIBRARY_PATH = lib.makeLibraryPath systemLibraries;
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
