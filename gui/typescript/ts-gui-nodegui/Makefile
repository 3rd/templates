SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
.RECIPEPREFIX = >
.DEFAULT_GOAL = help

BLUE := $(shell tput -Txterm setaf 4)
RESET := $(shell tput -Txterm sgr0)
BIN := node_modules/.bin

help: ## list commands
> @grep --no-filename -E '^[a-zA-Z_0-9%-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'
.PHONY: help

ifeq ($(origin IN_NIX_SHELL), undefined)

# a git-tracked flake is copied from git's file list, which keeps ignored build output out of the store
UNTRACKED_FLAKE_FILES := $(filter-out $(shell git ls-files flake.nix flake.lock 2>/dev/null),flake.nix flake.lock)
FLAKE_REF := $(if $(UNTRACKED_FLAKE_FILES),path:$(CURDIR),$(CURDIR))

DEV_TARGETS := dev run build test lint fmt clean verify
.PHONY: $(DEV_TARGETS)
$(DEV_TARGETS):
> nix develop "$(FLAKE_REF)" --option warn-dirty false -c $(MAKE) --no-print-directory $@

else

NODEGUI := node_modules/@nodegui/nodegui
QODE := node_modules/@nodegui/qode/binaries/qode

node_modules: package.json package-lock.json
> npm ci --ignore-scripts
> node node_modules/@nodegui/qode/install.js
> if [ -n "$${NIX_DYNAMIC_LINKER:-}" ]; then
>   patchelf --set-interpreter "$$NIX_DYNAMIC_LINKER" $(QODE)
> fi
> node $(NODEGUI)/scripts/setupMiniQt.js
> node $(NODEGUI)/scripts/setupBinary.js
> touch node_modules

dev: node_modules ## run the app, rebuilding and restarting on change
> watchexec --restart --watch src -- 'npm run --silent build && $(BIN)/qode dist/index.js' || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: dev

run: build ## build and run the app
> $(BIN)/qode dist/index.js || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: run

build: node_modules ## bundle the app into dist/
> npm run --silent build
.PHONY: build

test: node_modules ## run tests
> bun test
.PHONY: test

lint: node_modules ## typecheck the sources
> $(BIN)/tsc --noEmit
.PHONY: lint

fmt: node_modules ## format sources
> $(BIN)/prettier --write .
> nixfmt flake.nix
.PHONY: fmt

clean: ## remove build output and installed packages
> rm -rf dist node_modules
.PHONY: clean

verify: lint test build ## run all checks
.PHONY: verify

endif
