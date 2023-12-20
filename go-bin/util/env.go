package util

import (
	"os"

	_ "github.com/joho/godotenv/autoload"
)

type Env struct {
	SAMPLE_ENV_VAR string
}

func GetEnv() Env {
	env := Env{}
	if val, ok := os.LookupEnv("SAMPLE_VAR"); ok {
		env.SAMPLE_ENV_VAR = val
	}
	return env
}
