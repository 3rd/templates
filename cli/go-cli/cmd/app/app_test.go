package app

import (
	"bytes"
	"context"
	"encoding/json"
	"strings"
	"testing"
)

func TestHelloUsesProfileFlag(t *testing.T) {
	var stdout bytes.Buffer
	var stderr bytes.Buffer

	command := New("test", Streams{Err: &stderr, Out: &stdout})
	err := command.Run(context.Background(), []string{"app", "--profile", "local", "hello", "Ada"})
	if err != nil {
		t.Fatal(err)
	}

	if got := strings.TrimSpace(stdout.String()); got != "hello, Ada (profile: local)" {
		t.Fatalf("unexpected output: %q", got)
	}
	if !strings.Contains(stderr.String(), "profile=local") {
		t.Fatalf("expected structured log to include profile, got %q", stderr.String())
	}
}

func TestConfigReadsEnvironmentAndJSONFlag(t *testing.T) {
	t.Setenv("APP_PROFILE", "ci")

	var stdout bytes.Buffer
	command := New("test", Streams{Out: &stdout})
	err := command.Run(context.Background(), []string{"app", "--json", "config"})
	if err != nil {
		t.Fatal(err)
	}

	var body map[string]any
	if err := json.Unmarshal(stdout.Bytes(), &body); err != nil {
		t.Fatal(err)
	}
	if body["profile"] != "ci" {
		t.Fatalf("expected profile from env, got %#v", body["profile"])
	}
	if body["json"] != true {
		t.Fatalf("expected json flag to be true")
	}
}
