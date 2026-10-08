package main

import (
	"fmt"
	"testing"

	"fyne.io/fyne/v2/test"
)

func TestNoteStatusCountsCodePoints(t *testing.T) {
	for _, fixture := range []struct {
		note  string
		count int
	}{{"", 0}, {"é", 1}, {"😀", 1}, {"e\u0301", 2}, {"é😀", 2}} {
		t.Run(fixture.note, func(t *testing.T) {
			got := statusText(tabNotes, 0, fixture.note, true)
			want := fmt.Sprintf("Notes · %d characters", fixture.count)
			if got != want {
				t.Errorf("status = %q, want %q", got, want)
			}
		})
	}
}

func TestIncrementButtonUpdatesCounterLabel(t *testing.T) {
	test.NewApp()

	content := newWorkspace()

	if content.countLabel.Text != "Count: 0" {
		t.Fatalf("initial label = %q, want %q", content.countLabel.Text, "Count: 0")
	}

	test.Tap(content.increment)

	if content.countLabel.Text != "Count: 1" {
		t.Errorf("label after one tap = %q, want %q", content.countLabel.Text, "Count: 1")
	}
}
