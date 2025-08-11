SHELL     := bash
.SHELLFLAGS := -eu -o pipefail -c
.ONESHELL:
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules
.RECIPEPREFIX = >
.DEFAULT_GOAL = help

HOME := ${HOME}
UNAME     = $(shell uname -s | tr A-Z a-z)
HOSTNAME  = $(shell hostname)
SOURCE    = $(realpath $(dir $(realpath $(lastword $(MAKEFILE_LIST)))))

BLACK     = $(shell tput -Txterm setaf 0)
RED       = $(shell tput -Txterm setaf 1)
GREEN     = $(shell tput -Txterm setaf 2)
YELLOW    = $(shell tput -Txterm setaf 3)
BLUE      = $(shell tput -Txterm setaf 4)
MAGENTA   = $(shell tput -Txterm setaf 5)
CYAN      = $(shell tput -Txterm setaf 6)
WHITE     = $(shell tput -Txterm setaf 7)
RESET     = $(shell tput -Txterm sgr0)

help: ## help
>@grep --no-filename -E '^[a-zA-Z_0-9%-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "${BLUE}%-20s${RESET} %s\n", $$1, $$2}'
.PHONY: help

build: ## build
>bun run build
.PHONY: build

