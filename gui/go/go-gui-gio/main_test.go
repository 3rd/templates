package main

import (
	"fmt"
	"image"
	"testing"

	"gioui.org/io/input"
	"gioui.org/io/key"
	"gioui.org/layout"
	"gioui.org/op"
	"gioui.org/unit"
)

func TestNoteStatusCountsCodePoints(t *testing.T) {
	for _, fixture := range []struct {
		note  string
		count int
	}{{"", 0}, {"é", 1}, {"😀", 1}, {"e\u0301", 2}, {"é😀", 2}} {
		t.Run(fixture.note, func(t *testing.T) {
			workspace := newWorkspaceUI()
			workspace.tab = tabNotes
			workspace.noteEditor.SetText(fixture.note)

			got := workspace.status()
			want := fmt.Sprintf("Notes · %d characters", fixture.count)
			if got != want {
				t.Errorf("status = %q, want %q", got, want)
			}
		})
	}
}

func TestIncrementButtonAdvancesCount(t *testing.T) {
	counter := newWorkspaceUI()
	var ops op.Ops

	frame := func() layout.Dimensions {
		return counter.layout(layout.Context{
			Ops:         &ops,
			Constraints: layout.Exact(image.Pt(768, 512)),
			Metric:      unit.Metric{PxPerDp: 1, PxPerSp: 1},
		})
	}

	if dimensions := frame(); dimensions.Size.X == 0 || dimensions.Size.Y == 0 {
		t.Fatalf("first frame laid out to %v, want a non-empty size", dimensions.Size)
	}

	counter.incrementButton.Click()
	frame()

	if counter.count != 1 {
		t.Errorf("count after one click = %d, want 1", counter.count)
	}
}

func TestApplyButtonReportsSavedName(t *testing.T) {
	workspace := newWorkspaceUI()
	var ops op.Ops

	frame := func() {
		workspace.layout(layout.Context{
			Ops:         &ops,
			Constraints: layout.Exact(image.Pt(768, 512)),
			Metric:      unit.Metric{PxPerDp: 1, PxPerSp: 1},
		})
	}

	workspace.settingsTab.Click()
	frame()
	workspace.nameEditor.SetText("Ada")
	workspace.applyButton.Click()
	frame()

	if got := workspace.status(); got != "Settings · Saved as Ada" {
		t.Errorf("status after apply = %q, want %q", got, "Settings · Saved as Ada")
	}
}

func TestApplyButtonUsesQueuedNameEdit(t *testing.T) {
	workspace := newWorkspaceUI()
	var ops op.Ops
	var router input.Router
	gtx := layout.Context{
		Ops:         &ops,
		Constraints: layout.Exact(image.Pt(768, 512)),
		Metric:      unit.Metric{PxPerDp: 1, PxPerSp: 1},
		Source:      router.Source(),
	}
	workspace.settingsTab.Click()
	gtx.Execute(key.FocusCmd{Tag: &workspace.nameEditor})
	workspace.layout(gtx)
	router.Frame(&ops)

	router.Queue(key.EditEvent{Range: key.Range{Start: 0, End: len(appName)}, Text: "Ada"})
	workspace.applyButton.Click()
	ops.Reset()
	workspace.layout(gtx)
	if got := workspace.status(); got != "Settings · Saved as Ada" {
		t.Errorf("status after queued edit and apply = %q, want %q", got, "Settings · Saved as Ada")
	}
}
