{
  description = "A modern, lean Neovim plugin starter";

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
        default = packagesFor.${system}.mkShellNoCC {
          packages = with packagesFor.${system}; [
            bashInteractive
            git
            gnumake
            lua-language-server
            neovim
            nixfmt
            ripgrep
            shellcheck
            stylua
          ];
        };
      });

      formatter = forAllSystems (system: packagesFor.${system}.nixfmt);
    };
}
