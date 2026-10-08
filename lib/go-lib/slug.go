package golib

import (
	"strings"
	"unicode"
)

type SlugOptions struct {
	MaxLength int
}

func Slug(value string, options SlugOptions) string {
	normalized := strings.ToLower(strings.TrimSpace(value))
	var builder strings.Builder
	lastWasDash := false

	for _, r := range normalized {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			builder.WriteRune(r)
			lastWasDash = false
			continue
		}

		if builder.Len() > 0 && !lastWasDash {
			builder.WriteByte('-')
			lastWasDash = true
		}
	}

	result := strings.Trim(builder.String(), "-")
	runes := []rune(result)
	if options.MaxLength <= 0 || len(runes) <= options.MaxLength {
		return result
	}

	return strings.Trim(string(runes[:options.MaxLength]), "-")
}
