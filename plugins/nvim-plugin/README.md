# nvim-plugin.nvim

A modern Neovim plugin starter with a small runtime, real integration tests, Vim help, health checks, LuaLS types, pinned development tools, and a minimum/stable/nightly CI matrix.

It targets Neovim 0.11 or newer and Lua 5.1 syntax.

## Rename This Template First

Run the one-shot rename script before editing public names:

```bash
./scripts/rename-plugin.sh smart-pairs.nvim
```

The name must use lowercase kebab-case. The `.nvim` suffix is optional. For `smart-pairs.nvim`, the script uses `smart-pairs` for the Lua module, `SmartPairs` for commands and LuaLS types, and `smart_pairs` for the runtime load guard. It updates every matching text file and renames the Lua module directory, plugin entrypoint, help file, and test file.

The script refuses invalid names, existing destinations, and projects missing expected template paths or tokens. It also reserves the built-in Lua and Neovim module names `bit`, `coroutine`, `debug`, `ffi`, `io`, `jit`, `lpeg`, `luv`, `math`, `mpack`, `os`, `package`, `string`, and `table`, which would prevent the renamed plugin from loading. It leaves the enclosing checkout directory alone so it does not invalidate the current shell. Replace `you` in install URLs, choose a license, and replace this README description after it finishes.

## Install

With Neovim 0.12's experimental built-in package manager:

```lua
vim.pack.add({ "https://github.com/you/nvim-plugin.nvim" })

require("nvim-plugin").setup({
  greeting = "Welcome",
})
```

With lazy.nvim on Neovim 0.11 or newer:

```lua
{
  "you/nvim-plugin.nvim",
  opts = {
    greeting = "Welcome",
  },
}
```

`setup()` is optional. Defaults work immediately.

## Use

Call the public Lua API when another module needs the value:

```lua
local message = require("nvim-plugin").greet("Ada")
```

Use the command for editor output:

```vim
:NvimPluginGreet Ada
```

Run the health check when installation or compatibility is uncertain:

```vim
:checkhealth nvim-plugin
```

Read the complete help inside Neovim:

```vim
:help nvim-plugin
```

## Structure

```text
plugin/nvim-plugin.lua         Small eager entrypoint that registers commands
lua/nvim-plugin/init.lua       Public API, defaults, and configuration validation
lua/nvim-plugin/health.lua     :checkhealth implementation
doc/nvim-plugin.txt            Vim help source
tests/test_nvim_plugin.lua     Isolated child-Neovim integration tests
tests/test_rename_plugin.sh    Rename helper behavior and refusal tests
scripts/minimal-init.lua       Reproducible test startup
scripts/rename-plugin.sh       One-shot exhaustive plugin rename
flake.nix / flake.lock         Reproducible Nix development shell
```

The entrypoint defers `require("nvim-plugin")` until the command runs. Defaults do not require `setup()`. Configuration and editor I/O stay separate, and there are no empty directories or utility modules waiting for hypothetical features.

Add `ftplugin/`, `after/`, `autoload/`, or a separate configuration module only when the plugin gains the lifecycle that the directory or module represents.

## Develop

With Nix, enter the pinned development shell and install the test dependency:

```bash
nix develop path:.
make deps
```

The shell supports ARM macOS plus ARM and x86_64 Linux. It provides Neovim, Bash, Git, GNU Make, LuaLS, Nixfmt, ripgrep, ShellCheck, and StyLua. Run `nixfmt flake.nix` inside the shell to format the flake. The explicit `path:.` also works before the template files are tracked by Git. Intel macOS users can use the Mise path below.

Without Nix, install these requirements:

- Neovim 0.11 or newer
- Git, GNU Make, and Bash
- Mise, or the StyLua, LuaLS, ripgrep, and ShellCheck versions pinned in `.mise.toml` installed directly

Then install the pinned tools and test dependency:

```bash
mise install
make deps
```

Use the focused commands while working:

```bash
make test
make test-file FILE=tests/test_nvim_plugin.lua
make format
make format-check
make lua-check
make script-check
make docs
make verify
```

`make test` exercises public behavior in fresh child Neovim processes. It proves the lazy command boundary, configuration validation and reset behavior, command output, health report, and generated help.

`make docs` regenerates the tracked `doc/tags` file. `make docs-check` generates tags in a temporary directory and compares them with the tracked file without modifying it.

The test harness pins standalone mini.test in one `MINI_TEST_COMMIT` definition in the Makefile. To update it, resolve the current stable commit, change that definition, and rerun the full CI matrix:

```bash
git ls-remote https://github.com/nvim-mini/mini.test.git refs/heads/stable
```

Update tools deliberately in `.mise.toml`. Refresh the Nix lock with `nix flake update`, then run `nix flake check path:. --no-build --all-systems` and `make verify`.

## Release

Neovim plugin managers install the source tree directly, so this starter has no build artifact, rockspec, or release workflow.

Before a release:

1. Confirm the one-shot rename is complete and every install example uses the final repository name.
2. Choose and add the project license.
3. Run `make verify` on the supported minimum Neovim version.
4. Confirm the stable and nightly CI jobs.
5. Create a SemVer tag and a GitHub release from that tested commit.

Raising the minimum Neovim version is a breaking compatibility change.

## Design References

- [Neovim's Lua plugin guide](https://neovim.io/doc/user/lua-plugin/)
- [Neovim's health-check contract](https://neovim.io/doc/user/health/)
- [mini.test's testing guide](https://nvim-mini.org/mini.nvim/TESTING.html)
- [LuaLS command-line usage](https://luals.github.io/wiki/usage/)
- [StyLua configuration](https://github.com/JohnnyMorganz/StyLua)
