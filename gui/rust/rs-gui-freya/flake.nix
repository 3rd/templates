{
  description = "Freya desktop application template";

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
          inherit (pkgs) lib stdenv;

          graphicsLibraries = lib.optionals stdenv.hostPlatform.isLinux (
            with pkgs;
            [
              libGL
              libx11
              libxcursor
              libxi
              libxkbcommon
              libxrandr
              vulkan-loader
              wayland
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
              pkg-config
              rustc
              rustfmt
            ];

            buildInputs =
              lib.optionals stdenv.hostPlatform.isLinux (
                with pkgs;
                [
                  expat
                  fontconfig
                  freetype
                ]
              )
              ++ graphicsLibraries;

            LD_LIBRARY_PATH = lib.makeLibraryPath graphicsLibraries;
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
