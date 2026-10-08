package main

import (
	"fmt"
	"os"
	"testing"

	qt "github.com/mappu/miqt/qt6"
	"github.com/mappu/miqt/qt6/mainthread"
)

func TestMain(m *testing.M) {
	qt.NewQApplication(append(os.Args, "-platform", "offscreen"))

	// Qt's event loop has to own the main thread, so the tests run beside it and reach
	// widgets through mainthread.Wait.
	exitCode := make(chan int, 1)
	go func() {
		exitCode <- m.Run()
		mainthread.Start(qt.QCoreApplication_Quit)
	}()

	qt.QApplication_Exec()
	os.Exit(<-exitCode)
}

func TestNoteStatusCountsCodePoints(t *testing.T) {
	for _, fixture := range []struct {
		note  string
		count int
	}{{"", 0}, {"é", 1}, {"😀", 1}, {"e\u0301", 2}, {"é😀", 2}} {
		t.Run(fixture.note, func(t *testing.T) {
			got := mainthread.Wait2(func() string {
				content := newWorkspace()
				defer content.root.Delete()

				content.tabs.SetCurrentIndex(int(tabNotes))
				content.noteEdit.SetText(fixture.note)

				return content.status.Text()
			})

			want := fmt.Sprintf("Notes · %d characters", fixture.count)
			if got != want {
				t.Errorf("status = %q, want %q", got, want)
			}
		})
	}
}

func TestIncrementButtonUpdatesCounterLabel(t *testing.T) {
	var initial, afterClick, status string
	mainthread.Wait(func() {
		content := newWorkspace()
		defer content.root.Delete()

		initial = content.countLabel.Text()
		content.incrementButton.Click()
		afterClick = content.countLabel.Text()
		status = content.status.Text()
	})

	if initial != "Count: 0" {
		t.Fatalf("initial label = %q, want %q", initial, "Count: 0")
	}

	if afterClick != "Count: 1" {
		t.Errorf("label after one click = %q, want %q", afterClick, "Count: 1")
	}

	if status != "Home · Count 1" {
		t.Errorf("status after one click = %q, want %q", status, "Home · Count 1")
	}
}

func TestSavedStatusLastsUntilTabSwitch(t *testing.T) {
	var saved, afterSwitch string
	mainthread.Wait(func() {
		content := newWorkspace()
		defer content.root.Delete()

		content.tabs.SetCurrentIndex(int(tabSettings))
		content.nameEdit.SetText("Ada")
		content.applyButton.Click()
		saved = content.status.Text()
		content.tabs.SetCurrentIndex(int(tabHome))
		afterSwitch = content.status.Text()
	})

	if saved != "Settings · Saved as Ada" {
		t.Errorf("status after apply = %q, want %q", saved, "Settings · Saved as Ada")
	}

	if afterSwitch != "Home · Count 0" {
		t.Errorf("status after switching to Home = %q, want %q", afterSwitch, "Home · Count 0")
	}
}
