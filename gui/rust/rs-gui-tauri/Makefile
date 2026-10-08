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

CARGO_MANIFEST := src-tauri/Cargo.toml
CARGO_TARGET_DIR ?= src-tauri/target

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

node_modules: package.json package-lock.json
> npm ci
> touch node_modules

dev: node_modules ## watch frontend and rust
> cargo tauri dev
.PHONY: dev

run: build ## build and run the app
> $(CARGO_TARGET_DIR)/release/rs-gui-tauri
.PHONY: run

build: node_modules ## build the app
> cargo tauri build --no-bundle
.PHONY: build

test: ## run tests
> cargo test --manifest-path $(CARGO_MANIFEST)
.PHONY: test

lint: node_modules ## run clippy and typecheck the frontend
> cargo clippy --manifest-path $(CARGO_MANIFEST) --all-targets -- -D warnings
> npm run typecheck
.PHONY: lint

fmt: ## format sources
> cargo fmt --manifest-path $(CARGO_MANIFEST)
.PHONY: fmt

clean: ## remove build output
> cargo clean --manifest-path $(CARGO_MANIFEST)
> rm -rf dist node_modules src-tauri/gen
.PHONY: clean

verify: lint test build ## run all checks
.PHONY: verify

endif
