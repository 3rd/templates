# go-lib

A small Go library template with a public package, focused tests, `go vet`, and `golangci-lint`.

## Commands

```bash
go test ./...
go vet ./...
golangci-lint run
```

The sample package exposes `Slug`, which normalizes a string into a URL-safe slug.
