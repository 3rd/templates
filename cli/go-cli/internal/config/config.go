package config

import (
	"strings"

	"github.com/urfave/cli/v3"
)

type Config struct {
	JSON    bool   `json:"json"`
	Profile string `json:"profile"`
}

func FromCommand(cmd *cli.Command) Config {
	profile := strings.TrimSpace(cmd.String("profile"))
	if profile == "" {
		profile = "dev"
	}

	return Config{
		JSON:    cmd.Bool("json"),
		Profile: profile,
	}
}
