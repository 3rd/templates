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

APP := go-gui-wails

WEBKIT_TAG := webkit2_41
GO_TAGS := desktop,production,$(WEBKIT_TAG)

help: ## list commands
> @grep --no-filename -E '^[a-zA-Z_0-9%-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(BLUE)%-20s$(RESET) %s\n", $$1, $$2}'
.PHONY: help

ifeq ($(origin IN_NIX_SHELL), undefined)

# a git-tracked flake is copied from git's file list, which keeps ignored build output out of the store
UNTRACKED_FLAKE_FILES := $(filter-out $(shell git ls-files flake.nix flake.lock 2>/dev/null),flake.nix flake.lock)
FLAKE_REF := $(if $(UNTRACKED_FLAKE_FILES),path:$(CURDIR),$(CURDIR))

DEV_TARGETS := dev run build frontend bindings test lint fmt clean verify
.PHONY: $(DEV_TARGETS)
$(DEV_TARGETS):
> nix develop "$(FLAKE_REF)" --option warn-dirty false -c $(MAKE) --no-print-directory $@

else

dev: ## run with frontend hot reload
> wails dev -tags $(WEBKIT_TAG) || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: dev

run: build ## build and run the app
> ./bin/$(APP) || { s=$$?; [ $$s -eq 130 ] || [ $$s -eq 143 ] || exit $$s; }
.PHONY: run

build: frontend ## build the app
> go build -tags $(GO_TAGS) -ldflags "-s -w" -o bin/$(APP) .
.PHONY: build

frontend: frontend/node_modules ## build the React frontend into frontend/dist
> cd frontend && npm run build
.PHONY: frontend

frontend/node_modules: frontend/package-lock.json
> cd frontend
> npm ci
> touch node_modules

bindings: ## regenerate the TypeScript bindings for the bound Go methods
> wails generate module -tags $(WEBKIT_TAG)
.PHONY: bindings

test: frontend/node_modules ## run tests
> go test -tags $(GO_TAGS) ./...
> cd frontend && npm run typecheck
.PHONY: test

lint: ## run go vet
> go vet -tags $(GO_TAGS) ./...
.PHONY: lint

fmt: ## format sources
> go fmt ./...
.PHONY: fmt

clean: ## remove build output
> rm -rf bin build frontend/node_modules frontend/dist
> mkdir -p frontend/dist && touch frontend/dist/.gitkeep
.PHONY: clean

verify: lint test build ## run all checks
.PHONY: verify

endif
