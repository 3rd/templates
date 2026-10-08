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

dev: ## watch and rerun on change
> cargo watch -x run
.PHONY: dev

run: ## build and run the app
> cargo run --release
.PHONY: run

build: ## build the app
> cargo build --release
.PHONY: build

test: ## run tests
> cargo test
.PHONY: test

lint: ## run clippy
> cargo clippy --all-targets -- -D warnings
.PHONY: lint

fmt: ## format sources
> cargo fmt
.PHONY: fmt

clean: ## remove build output
> cargo clean
.PHONY: clean

verify: lint test build ## run all checks
.PHONY: verify

endif
