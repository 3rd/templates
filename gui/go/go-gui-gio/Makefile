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

APP := go-gui-gio

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

dev: run ## run the app (Gio has no watch mode)
.PHONY: dev

run: ## build and run the app
> go run . || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: run

build: ## build the app
> go build -o bin/$(APP) .
.PHONY: build

test: ## run tests
> go test ./...
.PHONY: test

lint: ## run go vet
> go vet ./...
.PHONY: lint

fmt: ## format sources
> go fmt ./...
.PHONY: fmt

clean: ## remove build output
> rm -rf bin
.PHONY: clean

verify: lint test build ## run all checks
.PHONY: verify

endif
