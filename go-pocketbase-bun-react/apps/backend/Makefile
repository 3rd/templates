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

BLUE      = $(shell tput -Txterm setaf 4)
RESET     = $(shell tput -Txterm sgr0)

help: ## help
>@grep -E '^[a-zA-Z_0-9%-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "${BLUE}%-20s${RESET} %s\n", $$1, $$2}'
.PHONY: help

build: ## build
>CGO_ENABLED=0 go build -o bin/server main.go
# >GOARCH=amd64 GOOS=linux go build -o bin/server-linux-amd64 main.go
>CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -o bin/server-linux-amd64 main.go
>CGO_ENABLED=0 GOARCH=amd64 GOOS=linux go build -o bin/server-alpine main.go
>docker build -t server .
# >GOARCH=arm GOOS=linux go build -o bin/server-linux-arm main.go
# >GOARCH=arm64 GOOS=linux go build -o bin/server-linux-arm64 main.go
# >GOARCH=amd64 GOOS=darwin go build -o bin/server-darwin-amd64 main.go
# >GOARCH=amd64 GOOS=windows go build -o bin/server-windows-amd64 main.go
.PHONY: build

deploy: ## deploy
>make build
>rsync -a ./bin/server-linux-amd64 wire:/app/packages/database/server
>ssh wire "systemctl daemon-reload && systemctl restart database"
.PHONY: deploy

run: ## run
>docker run -it -p 8090:8090 -v $(SOURCE)/pb_data:/app/pb_data server
.PHONY: run

dev: ## dev
>watchexec --exts ".go" --ignore "pb_data" -r "go run main.go serve"
.PHONY: dev

clean: ## clean
>go clean
>rm -rf bin
.PHONY: clean

test: ## test
>go test ./...
.PHONY: test

test-coverage: ## test and generate coverage
>go test ./... -coverprofile=coverage.out
.PHONY: test-coverage

# go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.50.0
lint: ## lint
>golangci-lint run
.PHONY: lint

migrate-gen: ## generate a migration
>go run main.go migrate collections
.PHONY: migrate-gen

migrate-up: ## migrate up
>go run main.go migrate up
.PHONY: migrate-up

migrate-down: ## migrate down
>go run main.go migrate down
.PHONY: migrate-down

