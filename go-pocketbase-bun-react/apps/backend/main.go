package main

import (
	"log"
	"os"
	"strings"

	_ "main/migrations"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
)

func main() {
	app := pocketbase.New()

	app.OnServe().BindFunc(func(se *core.ServeEvent) error {
		se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
		return se.Next()
	})

	isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		Automigrate: isGoRun,
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}

	// custom routes
	// app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
	// 	e.Router.AddRoute(echo.Route{
	// 		Method:  http.MethodPost,
	// 		Path:    "/custom",
	// 		Handler: api.CustomHandler(e.App.Dao()),
	// 		Middlewares: []echo.MiddlewareFunc{
	// 			apis.ActivityLogger(e.App),
	// 			apis.RequireRecordAuth("users"),
	// 		},
	// 	})
	// 	return nil
	// })

	// hooks
	// app.OnRecordAfterUpdateRequest("settings").Add(func(e *core.RecordUpdateEvent) error {
	// 	key := e.Record.Get("key")
	// 	if key == "some_key_value" {
	// 		parsedValue := ""
	// 		e.Record.UnmarshalJSONField("value", &parsedValue)
	// 		if parsedValue != "" {
	// 			ctrl.DoSomething(app.Dao(), parsedValue)
	// 		}
	// 	}
	// 	return nil
	// })
}
