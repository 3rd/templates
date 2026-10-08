package golib

import "testing"

func TestSlug(t *testing.T) {
	tests := map[string]struct {
		input   string
		options SlugOptions
		want    string
	}{
		"collapses separators": {
			input: " Hello,   Go templates! ",
			want:  "hello-go-templates",
		},
		"keeps unicode letters": {
			input: "Bun și Go",
			want:  "bun-și-go",
		},
		"trims max length and trailing separators": {
			input:   "alpha beta gamma",
			options: SlugOptions{MaxLength: 10},
			want:    "alpha-beta",
		},
		"truncates unicode without corrupting text": {
			input:   "Åland islands",
			options: SlugOptions{MaxLength: 5},
			want:    "åland",
		},
	}

	for name, test := range tests {
		t.Run(name, func(t *testing.T) {
			if got := Slug(test.input, test.options); got != test.want {
				t.Fatalf("Slug() = %q, want %q", got, test.want)
			}
		})
	}
}
