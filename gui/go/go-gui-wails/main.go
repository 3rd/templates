package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

const appName = "go-gui-wails"

func main() {
	err := wails.Run(&options.App{
		Title:         appName,
		DisableResize: false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		Bind: []any{
			&Greeter{},
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
