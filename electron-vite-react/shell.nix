with import <nixpkgs> { };

mkShell {
  nativeBuildInputs = [ nodejs_20 electron nodePackages.pnpm ];

  ELECTRON_IS_DEV = "1";
  ELECTRON_OVERRIDE_DIST_PATH = "${electron}/bin";
}
