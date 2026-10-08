package main

import "fmt"

type Greeter struct{}

func (g *Greeter) Greet(name string) string {
	return fmt.Sprintf("Hello %s, from Go", name)
}
