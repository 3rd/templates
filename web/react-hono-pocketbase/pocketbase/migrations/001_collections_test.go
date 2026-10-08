package migrations

import (
	"strings"
	"testing"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func TestTaskMigrationPreservesBuiltInUsersAndTimestamps(t *testing.T) {
	app := pocketbase.NewWithConfig(pocketbase.Config{DefaultDataDir: t.TempDir()})
	if err := app.Bootstrap(); err != nil {
		t.Fatal(err)
	}

	t.Cleanup(func() {
		if err := app.ResetBootstrapState(); err != nil {
			t.Error(err)
		}
	})

	if err := app.RunAppMigrations(); err != nil {
		t.Fatal(err)
	}

	users, err := app.FindCollectionByNameOrId("users")
	if err != nil {
		t.Fatal(err)
	}
	if users.Id != "_pb_users_auth_" || users.CreateRule == nil || *users.CreateRule != "" {
		t.Fatal("built-in users registration must remain available")
	}

	user := core.NewRecord(users)
	user.SetEmail("ada@example.com")
	user.SetPassword("password123")
	user.Set("name", strings.Repeat("a", 121))
	if err := app.Save(user); err == nil {
		t.Fatal("user names longer than 120 characters must be rejected")
	}

	user.Set("name", strings.Repeat("a", 120))
	if err := app.Save(user); err != nil {
		t.Fatal(err)
	}

	tasks, err := app.FindCollectionByNameOrId("tasks")
	if err != nil {
		t.Fatal(err)
	}

	task := core.NewRecord(tasks)
	task.Set("owner", user.Id)
	task.Set("title", "First task")
	if err := app.Save(task); err != nil {
		t.Fatal(err)
	}
	if task.GetString("created") == "" || task.GetString("updated") == "" {
		t.Fatal("task timestamps must be populated")
	}

	runner := core.NewMigrationsRunner(app, core.AppMigrations)
	if _, err := runner.Down(1); err != nil {
		t.Fatal(err)
	}
	preservedUser, err := app.FindRecordById("users", user.Id)
	if err != nil {
		t.Fatalf("rollback removed a pre-existing user: %v", err)
	}

	preservedUser.Set("name", strings.Repeat("a", 255))
	if err := app.Save(preservedUser); err != nil {
		t.Fatalf("rollback did not restore the built-in name limit: %v", err)
	}

	if err := app.RunAppMigrations(); err != nil {
		t.Fatal(err)
	}
}
