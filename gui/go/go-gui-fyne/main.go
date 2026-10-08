package main

import (
	"fmt"
	"unicode/utf8"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/app"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"
)

const appName = "go-gui-fyne"

type tab int

const (
	tabHome tab = iota
	tabNotes
	tabSettings
)

func countText(count int) string {
	return fmt.Sprintf("Count: %d", count)
}

type workspace struct {
	root       fyne.CanvasObject
	countLabel *widget.Label
	increment  *widget.Button
}

func statusText(current tab, count int, note string, notifications bool) string {
	switch current {
	case tabNotes:
		return fmt.Sprintf("Notes · %d characters", utf8.RuneCountInString(note))
	case tabSettings:
		if notifications {
			return "Settings · Notifications on"
		}
		return "Settings · Notifications off"
	default:
		return fmt.Sprintf("Home · Count %d", count)
	}
}

func newWorkspace() *workspace {
	count := 0
	note := ""
	notifications := true
	displayName := appName
	currentTab := tabHome

	countLabel := widget.NewLabel(countText(count))
	status := widget.NewLabel(statusText(currentTab, count, note, notifications))
	preview := widget.NewLabel("Preview: (empty)")
	noteEntry := widget.NewEntry()
	noteEntry.SetPlaceHolder("Write a note")
	nameEntry := widget.NewEntry()
	nameEntry.SetText(displayName)

	refreshStatus := func() {
		status.SetText(statusText(currentTab, count, note, notifications))
	}

	increment := widget.NewButton("Increment", func() {
		count++
		countLabel.SetText(countText(count))
		refreshStatus()
	})
	reset := widget.NewButton("Reset", func() {
		count = 0
		countLabel.SetText(countText(0))
		refreshStatus()
	})

	noteEntry.OnChanged = func(value string) {
		note = value
		if value == "" {
			preview.SetText("Preview: (empty)")
		} else {
			preview.SetText("Preview: " + value)
		}
		refreshStatus()
	}

	home := container.NewVBox(
		widget.NewLabel("Home"),
		widget.NewLabel("A desktop shell with tabs, a content pane, and a few working controls."),
		countLabel,
		container.NewHBox(increment, reset),
	)
	notes := container.NewVBox(
		widget.NewLabel("Notes"),
		widget.NewLabel("Note"),
		noteEntry,
		preview,
		widget.NewButton("Clear", func() {
			noteEntry.SetText("")
		}),
	)
	notificationsCheck := widget.NewCheck("Notifications", func(value bool) {
		notifications = value
		refreshStatus()
	})
	notificationsCheck.SetChecked(true)

	settings := container.NewVBox(
		widget.NewLabel("Settings"),
		notificationsCheck,
		widget.NewLabel("Display name"),
		nameEntry,
		widget.NewButton("Apply", func() {
			displayName = nameEntry.Text
			status.SetText("Settings · Saved as " + displayName)
		}),
	)

	homeItem := container.NewTabItem("Home", home)
	notesItem := container.NewTabItem("Notes", notes)
	settingsItem := container.NewTabItem("Settings", settings)
	tabByItem := map[*container.TabItem]tab{
		homeItem:     tabHome,
		notesItem:    tabNotes,
		settingsItem: tabSettings,
	}

	tabs := container.NewAppTabs(homeItem, notesItem, settingsItem)
	tabs.OnSelected = func(item *container.TabItem) {
		currentTab = tabByItem[item]
		refreshStatus()
	}

	header := container.NewBorder(
		nil, nil, nil, widget.NewLabel("starter"),
		container.NewVBox(
			widget.NewLabelWithStyle(appName, fyne.TextAlignLeading, fyne.TextStyle{Bold: true}),
			widget.NewLabel("Starter workspace"),
		),
	)

	root := container.NewBorder(header, status, nil, nil, tabs)
	return &workspace{root: root, countLabel: countLabel, increment: increment}
}

func main() {
	application := app.New()

	window := application.NewWindow(appName)
	window.SetContent(newWorkspace().root)
	window.SetFixedSize(false)

	window.ShowAndRun()
}
