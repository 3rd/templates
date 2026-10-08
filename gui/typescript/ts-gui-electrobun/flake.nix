{
  description = "Electrobun desktop application template built on the Bun runtime";

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
          webviewLibraries = [
            pkgs.cairo
            pkgs.gdk-pixbuf
            pkgs.glib
            pkgs.gtk3
            pkgs.libayatana-appindicator
            pkgs.libsoup_3
            pkgs.pango
            pkgs.stdenv.cc.cc.lib
            pkgs.webkitgtk_4_1
          ];
        in
        {
          default = pkgs.mkShellNoCC (
            {
              packages = [
                pkgs.bun
                pkgs.gnumake
                pkgs.nixfmt
                pkgs.nodejs_24
              ]
              ++ pkgs.lib.optional pkgs.stdenv.hostPlatform.isLinux pkgs.patchelf;
            }
            // pkgs.lib.optionalAttrs pkgs.stdenv.hostPlatform.isLinux {
              LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath webviewLibraries;

              NIX_DYNAMIC_LINKER = pkgs.stdenv.cc.bintools.dynamicLinker;

              WEBKIT_DISABLE_DMABUF_RENDERER = "1";
            }
          );
        }
      );

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
