package main

import (
	"fmt"
	"log"
	"os"
	"unicode/utf8"

	"gioui.org/app"
	"gioui.org/layout"
	"gioui.org/op"
	"gioui.org/unit"
	"gioui.org/widget"
	"gioui.org/widget/material"
)

const appName = "go-gui-gio"

type tab int

const (
	tabHome tab = iota
	tabNotes
	tabSettings
)

type workspaceUI struct {
	theme           *material.Theme
	homeTab         widget.Clickable
	notesTab        widget.Clickable
	settingsTab     widget.Clickable
	incrementButton widget.Clickable
	resetButton     widget.Clickable
	clearButton     widget.Clickable
	applyButton     widget.Clickable
	noteEditor      widget.Editor
	nameEditor      widget.Editor
	notifications   widget.Bool
	savedStatus     string
	tab             tab
	count           int
}

func newWorkspaceUI() *workspaceUI {
	ui := &workspaceUI{theme: material.NewTheme()}
	ui.notifications.Value = true
	ui.nameEditor.SetText(appName)
	return ui
}

func (w *workspaceUI) status() string {
	switch w.tab {
	case tabNotes:
		return fmt.Sprintf("Notes · %d characters", utf8.RuneCountInString(w.noteEditor.Text()))
	case tabSettings:
		if w.savedStatus != "" {
			return w.savedStatus
		}
		if w.notifications.Value {
			return "Settings · Notifications on"
		}
		return "Settings · Notifications off"
	default:
		return fmt.Sprintf("Home · Count %d", w.count)
	}
}

func (w *workspaceUI) layout(gtx layout.Context) layout.Dimensions {
	for _, editor := range []*widget.Editor{&w.noteEditor, &w.nameEditor} {
		for {
			if _, hasEvent := editor.Update(gtx); !hasEvent {
				break
			}
		}
	}

	previousTab := w.tab
	if w.homeTab.Clicked(gtx) {
		w.tab = tabHome
	}
	if w.notesTab.Clicked(gtx) {
		w.tab = tabNotes
	}
	if w.settingsTab.Clicked(gtx) {
		w.tab = tabSettings
	}

	if w.notifications.Update(gtx) || w.tab != previousTab {
		w.savedStatus = ""
	}
	if w.applyButton.Clicked(gtx) {
		w.savedStatus = "Settings · Saved as " + w.nameEditor.Text()
	}
	if w.incrementButton.Clicked(gtx) {
		w.count++
	}
	if w.resetButton.Clicked(gtx) {
		w.count = 0
	}
	if w.clearButton.Clicked(gtx) {
		w.noteEditor.SetText("")
	}

	return layout.Flex{Axis: layout.Vertical}.Layout(gtx,
		layout.Rigid(func(gtx layout.Context) layout.Dimensions {
			return layout.UniformInset(unit.Dp(12)).Layout(gtx, func(gtx layout.Context) layout.Dimensions {
				return layout.Flex{Axis: layout.Vertical}.Layout(gtx,
					layout.Rigid(material.H5(w.theme, appName).Layout),
					layout.Rigid(material.Body2(w.theme, "Starter workspace").Layout),
				)
			})
		}),
		layout.Rigid(func(gtx layout.Context) layout.Dimensions {
			return layout.Inset{Left: unit.Dp(12), Right: unit.Dp(12)}.Layout(gtx, func(gtx layout.Context) layout.Dimensions {
				return layout.Flex{Axis: layout.Horizontal, Spacing: layout.SpaceStart}.Layout(gtx,
					layout.Rigid(material.Button(w.theme, &w.homeTab, "Home").Layout),
					layout.Rigid(layout.Spacer{Width: unit.Dp(8)}.Layout),
					layout.Rigid(material.Button(w.theme, &w.notesTab, "Notes").Layout),
					layout.Rigid(layout.Spacer{Width: unit.Dp(8)}.Layout),
					layout.Rigid(material.Button(w.theme, &w.settingsTab, "Settings").Layout),
				)
			})
		}),
		layout.Flexed(1, func(gtx layout.Context) layout.Dimensions {
			return layout.UniformInset(unit.Dp(16)).Layout(gtx, w.layoutTab)
		}),
		layout.Rigid(func(gtx layout.Context) layout.Dimensions {
			return layout.UniformInset(unit.Dp(12)).Layout(gtx, material.Body2(w.theme, w.status()).Layout)
		}),
	)
}

func (w *workspaceUI) layoutTab(gtx layout.Context) layout.Dimensions {
	switch w.tab {
	case tabNotes:
		preview := "Preview: (empty)"
		if w.noteEditor.Text() != "" {
			preview = "Preview: " + w.noteEditor.Text()
		}
		return layout.Flex{Axis: layout.Vertical}.Layout(gtx,
			layout.Rigid(material.H6(w.theme, "Notes").Layout),
			layout.Rigid(material.Body1(w.theme, "Note").Layout),
			layout.Rigid(material.Editor(w.theme, &w.noteEditor, "Write a note").Layout),
			layout.Rigid(material.Body1(w.theme, preview).Layout),
			layout.Rigid(material.Button(w.theme, &w.clearButton, "Clear").Layout),
		)
	case tabSettings:
		return layout.Flex{Axis: layout.Vertical}.Layout(gtx,
			layout.Rigid(material.H6(w.theme, "Settings").Layout),
			layout.Rigid(material.CheckBox(w.theme, &w.notifications, "Notifications").Layout),
			layout.Rigid(material.Body1(w.theme, "Display name").Layout),
			layout.Rigid(material.Editor(w.theme, &w.nameEditor, "Display name").Layout),
			layout.Rigid(material.Button(w.theme, &w.applyButton, "Apply").Layout),
		)
	default:
		return layout.Flex{Axis: layout.Vertical}.Layout(gtx,
			layout.Rigid(material.H6(w.theme, "Home").Layout),
			layout.Rigid(material.Body1(w.theme, "A desktop shell with tabs, a content pane, and a few working controls.").Layout),
			layout.Rigid(material.Body1(w.theme, fmt.Sprintf("Count: %d", w.count)).Layout),
			layout.Rigid(func(gtx layout.Context) layout.Dimensions {
				return layout.Flex{Axis: layout.Horizontal}.Layout(gtx,
					layout.Rigid(material.Button(w.theme, &w.incrementButton, "Increment").Layout),
					layout.Rigid(layout.Spacer{Width: unit.Dp(8)}.Layout),
					layout.Rigid(material.Button(w.theme, &w.resetButton, "Reset").Layout),
				)
			}),
		)
	}
}

func run(window *app.Window) error {
	workspace := newWorkspaceUI()
	var ops op.Ops

	for {
		switch windowEvent := window.Event().(type) {
		case app.DestroyEvent:
			return windowEvent.Err
		case app.FrameEvent:
			gtx := app.NewContext(&ops, windowEvent)
			workspace.layout(gtx)
			windowEvent.Frame(gtx.Ops)
		}
	}
}

func main() {
	go func() {
		window := new(app.Window)
		window.Option(app.Title(appName))

		if err := run(window); err != nil {
			log.Fatal(err)
		}

		os.Exit(0)
	}()

	app.Main()
}
