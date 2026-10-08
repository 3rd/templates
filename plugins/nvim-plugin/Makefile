SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
.RECIPEPREFIX = >
.DEFAULT_GOAL = help

NVIM ?= nvim
STYLUA ?= stylua
LUA_LANGUAGE_SERVER ?= lua-language-server
SHELLCHECK ?= shellcheck
TMPDIR ?= /tmp

LUA_DIRS := lua plugin scripts tests
SHELL_SCRIPTS := scripts/rename-plugin.sh tests/test_rename_plugin.sh
LUALS_LOG_DIR ?= $(TMPDIR)/nvim-plugin-luals
MINI_TEST_REPOSITORY := https://github.com/nvim-mini/mini.test.git
MINI_TEST_COMMIT := 35c67cb7f2dc697ed0c7c06400fcf29a8a521d7d
MINI_TEST_DIR ?= .deps/mini.test
MINI_TEST_STAMP := $(MINI_TEST_DIR)/.commit-$(MINI_TEST_COMMIT)

help: ## list commands
> @awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_0-9%-]+:.*?## / {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
.PHONY: help

deps: $(MINI_TEST_STAMP) ## install pinned test dependencies
.PHONY: deps

$(MINI_TEST_STAMP):
> @mkdir -p "$(dir $(MINI_TEST_DIR))"
> if [[ ! -d "$(MINI_TEST_DIR)/.git" ]]; then
>   git clone --filter=blob:none --no-checkout "$(MINI_TEST_REPOSITORY)" "$(MINI_TEST_DIR)"
> fi
> git -C "$(MINI_TEST_DIR)" fetch --depth=1 origin "$(MINI_TEST_COMMIT)"
> git -C "$(MINI_TEST_DIR)" checkout --detach FETCH_HEAD
> touch "$@"

test: deps ## run all tests
> MINI_TEST_PATH="$(abspath $(MINI_TEST_DIR))" "$(NVIM)" --headless --noplugin \
>   -u scripts/minimal-init.lua -c "lua MiniTest.run()"
.PHONY: test

test-file: deps ## run FILE, for example make test-file FILE=tests/test_nvim_plugin.lua
> @test -n "$(FILE)" || { echo "FILE is required"; exit 2; }
> MINI_TEST_PATH="$(abspath $(MINI_TEST_DIR))" TEST_FILE="$(FILE)" \
>   "$(NVIM)" --headless --noplugin -u scripts/minimal-init.lua \
>   -c "lua MiniTest.run_file(vim.env.TEST_FILE)"
.PHONY: test-file

format: ## format Lua files
> "$(STYLUA)" $(LUA_DIRS)
.PHONY: format

format-check: ## check Lua formatting
> "$(STYLUA)" --check $(LUA_DIRS)
.PHONY: format-check

lua-check: ## run LuaLS diagnostics and type checks
> @mkdir -p "$(LUALS_LOG_DIR)"
> runtimePath="$$("$(NVIM)" --clean --headless -i NONE --cmd 'lua io.write(vim.env.VIMRUNTIME)' --cmd 'qa!')"
> VIMRUNTIME="$$runtimePath" "$(LUA_LANGUAGE_SERVER)" --check=. --checklevel=Warning --configpath=.luarc.json --logpath="$(LUALS_LOG_DIR)"
.PHONY: lua-check

script-check: ## lint and test shell scripts
> "$(SHELLCHECK)" $(SHELL_SCRIPTS)
> bash -n $(SHELL_SCRIPTS)
> bash tests/test_rename_plugin.sh
.PHONY: script-check

docs: ## regenerate Vim help tags
> "$(NVIM)" --headless -u NONE --noplugin -i NONE --cmd 'set noswapfile' \
>   -c "execute 'helptags ' .. fnameescape('doc')" -c 'qa!'
.PHONY: docs

docs-check: ## check that committed help tags are current
> tempDir="$$(mktemp -d "$(TMPDIR)/nvim-plugin-docs.XXXXXX")"
> trap 'rm -rf "$$tempDir"' EXIT
> cp doc/*.txt "$$tempDir/"
> "$(NVIM)" --headless -u NONE --noplugin -i NONE --cmd 'set noswapfile' \
>   -c "execute 'helptags ' .. fnameescape('$$tempDir')" -c 'qa!'
> diff -u doc/tags "$$tempDir/tags"
.PHONY: docs-check

verify: format-check lua-check script-check test docs-check ## run all checks
.PHONY: verify
