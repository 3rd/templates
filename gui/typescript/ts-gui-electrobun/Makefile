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

DEV_TARGETS := dev run build relink test lint fmt clean verify
.PHONY: $(DEV_TARGETS)
$(DEV_TARGETS):
> nix develop "$(FLAKE_REF)" --option warn-dirty false -c $(MAKE) --no-print-directory $@

else

node_modules: package.json package-lock.json
> npm ci
> touch node_modules

dev: node_modules ## build and run, rebuilding on change
> $(BIN)/electrobun dev --watch || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: dev

run: build ## build and run the app
> $(BIN)/electrobun run || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: run

build: node_modules ## build the app into build/
> $(BIN)/electrobun build
> $(MAKE) --no-print-directory relink
.PHONY: build

relink: ## point the prebuilt binaries at the dev shell loader
> if [ -z "$${NIX_DYNAMIC_LINKER:-}" ]; then
>   exit 0
> fi
> for tree in node_modules/electrobun build; do
>   [ -d "$$tree" ] || continue
>   for binary in $$(find "$$tree" -type f -perm -u+x); do
>     if patchelf --print-interpreter "$$binary" >/dev/null 2>&1; then
>       patchelf --set-interpreter "$$NIX_DYNAMIC_LINKER" "$$binary"
>     fi
>   done
> done
.PHONY: relink

test: node_modules ## run tests
> if [ -n "$$(find src -name '*.test.ts' -print -quit)" ]; then
>   bun test
> else
>   echo 'no test files'
> fi
.PHONY: test

lint: node_modules ## typecheck the sources
> $(BIN)/tsc --noEmit
.PHONY: lint

fmt: node_modules ## format sources
> $(BIN)/prettier --write .
> nixfmt flake.nix
.PHONY: fmt

clean: ## remove build output and installed packages
> rm -rf build artifacts node_modules
.PHONY: clean

verify: lint test build ## run all checks
.PHONY: verify

endif
