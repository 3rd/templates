package main

import (
	"context"
	"fmt"
	"os"

	"example.com/go-cli/cmd/app"
)

var version = "0.0.0"

func main() {
	command := app.New(version, app.Streams{
		Err: os.Stderr,
		In:  os.Stdin,
		Out: os.Stdout,
	})

	if err := command.Run(context.Background(), os.Args); err != nil {
		_, _ = fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
