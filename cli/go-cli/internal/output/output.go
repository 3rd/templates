package output

import (
	"encoding/json"
	"fmt"
	"io"

	"example.com/go-cli/internal/config"
)

type Greeting struct {
	Message string `json:"message"`
	Profile string `json:"profile"`
}

func WriteGreeting(w io.Writer, greeting Greeting, asJSON bool) error {
	if asJSON {
		return writeJSON(w, greeting)
	}

	_, err := fmt.Fprintf(w, "%s (profile: %s)\n", greeting.Message, greeting.Profile)
	return err
}

func WriteConfig(w io.Writer, cfg config.Config, asJSON bool) error {
	if asJSON {
		return writeJSON(w, cfg)
	}

	_, err := fmt.Fprintf(w, "profile: %s\njson: %t\n", cfg.Profile, cfg.JSON)
	return err
}

func writeJSON(w io.Writer, value any) error {
	encoder := json.NewEncoder(w)
	encoder.SetIndent("", "  ")
	return encoder.Encode(value)
}
