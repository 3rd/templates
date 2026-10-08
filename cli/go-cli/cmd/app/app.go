package app

import (
	"context"
	"fmt"
	"io"
	"log/slog"
	"os"

	"example.com/go-cli/internal/config"
	"example.com/go-cli/internal/output"
	"github.com/urfave/cli/v3"
)

type Streams struct {
	Err io.Writer
	In  io.Reader
	Out io.Writer
}

func New(version string, streams Streams) *cli.Command {
	streams = withDefaultStreams(streams)
	logger := slog.New(slog.NewTextHandler(streams.Err, &slog.HandlerOptions{}))

	return &cli.Command{
		Name:                  "app",
		Usage:                 "example Go CLI",
		Version:               version,
		EnableShellCompletion: true,
		Reader:                streams.In,
		Writer:                streams.Out,
		ErrWriter:             streams.Err,
		Flags: []cli.Flag{
			&cli.StringFlag{
				Name:    "profile",
				Sources: cli.EnvVars("APP_PROFILE"),
				Usage:   "runtime profile",
				Value:   "dev",
			},
			&cli.BoolFlag{
				Name:    "json",
				Sources: cli.EnvVars("APP_JSON"),
				Usage:   "write machine-readable output",
			},
		},
		Commands: []*cli.Command{
			{
				Name:      "hello",
				Usage:     "print a greeting",
				ArgsUsage: "[name]",
				Action: func(ctx context.Context, cmd *cli.Command) error {
					name := cmd.Args().First()
					if name == "" {
						name = "world"
					}

					settings := config.FromCommand(cmd)
					logger.InfoContext(ctx, "rendering greeting", "profile", settings.Profile)
					return output.WriteGreeting(streams.Out, output.Greeting{
						Message: fmt.Sprintf("hello, %s", name),
						Profile: settings.Profile,
					}, settings.JSON)
				},
			},
			{
				Name:  "config",
				Usage: "print resolved configuration",
				Action: func(_ context.Context, cmd *cli.Command) error {
					settings := config.FromCommand(cmd)
					return output.WriteConfig(streams.Out, settings, settings.JSON)
				},
			},
		},
	}
}

func withDefaultStreams(streams Streams) Streams {
	if streams.In == nil {
		streams.In = os.Stdin
	}

	if streams.Out == nil {
		streams.Out = os.Stdout
	}

	if streams.Err == nil {
		streams.Err = os.Stderr
	}

	return streams
}
