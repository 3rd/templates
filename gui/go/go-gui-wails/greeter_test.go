package main

import "testing"

func TestGreetIncludesTheGivenName(t *testing.T) {
	greeting := (&Greeter{}).Greet("Ada")

	if greeting != "Hello Ada, from Go" {
		t.Errorf("Greet(\"Ada\") = %q, want %q", greeting, "Hello Ada, from Go")
	}
}
