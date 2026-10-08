package migrations

import (
	"errors"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/tools/types"
)

func init() {
	const USER_NAME_FIELD_ERROR = "users.name must be a text field"

	m.Register(func(app core.App) error {
		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		nameField, isTextField := users.Fields.GetByName("name").(*core.TextField)
		if !isTextField {
			return errors.New(USER_NAME_FIELD_ERROR)
		}
		nameField.Max = 120
		if err := app.Save(users); err != nil {
			return err
		}

		ownerRule := "@request.auth.id != '' && owner = @request.auth.id"
		tasks := core.NewBaseCollection("tasks")
		tasks.ListRule = types.Pointer(ownerRule)
		tasks.ViewRule = types.Pointer(ownerRule)
		tasks.CreateRule = types.Pointer("@request.auth.id != '' && owner = @request.auth.id")
		tasks.UpdateRule = types.Pointer(ownerRule)
		tasks.DeleteRule = types.Pointer(ownerRule)
		tasks.Fields.Add(
			&core.RelationField{
				CollectionId: users.Id,
				MaxSelect:    1,
				Name:         "owner",
				Required:     true,
			},
			&core.TextField{
				Max:      160,
				Name:     "title",
				Required: true,
			},
			&core.BoolField{
				Name: "completed",
			},
			&core.AutodateField{
				Name:     "created",
				OnCreate: true,
			},
			&core.AutodateField{
				Name:     "updated",
				OnCreate: true,
				OnUpdate: true,
			},
		)
		tasks.Indexes = append(tasks.Indexes, "CREATE INDEX idx_tasks_owner_created ON tasks (owner, created, id)")

		return app.Save(tasks)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("tasks")
		if err != nil {
			return err
		}

		if err := app.Delete(collection); err != nil {
			return err
		}

		users, err := app.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		nameField, isTextField := users.Fields.GetByName("name").(*core.TextField)
		if !isTextField {
			return errors.New(USER_NAME_FIELD_ERROR)
		}
		nameField.Max = 255
		return app.Save(users)
	})
}
