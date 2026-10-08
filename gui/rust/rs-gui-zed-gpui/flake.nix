{
  description = "GPUI desktop application template";

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
          onLinux = lib.optionals pkgs.stdenv.hostPlatform.isLinux;
          runtimeLibraries = onLinux (
            with pkgs;
            [
              libGL
              libx11
              libxcb
              libxcursor
              libxext
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
              rust-analyzer
              rustc
              rustfmt
            ];

            buildInputs =
              onLinux (
                with pkgs;
                [
                  fontconfig
                  freetype
                ]
              )
              ++ runtimeLibraries;

            LD_LIBRARY_PATH = lib.makeLibraryPath runtimeLibraries;
          };
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
