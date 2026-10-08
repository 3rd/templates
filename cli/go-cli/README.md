# go-cli

A small Go CLI template using `urfave/cli/v3`, `context.Context`, injected streams, standard-library `slog`, and explicit flag/env configuration.

## Commands

```bash
go test ./...
go vet ./...
go build ./...
```

The sample command reads `--profile` or `APP_PROFILE`:

```bash
go run . hello Ada --profile local
APP_PROFILE=ci go run . hello --json
```
