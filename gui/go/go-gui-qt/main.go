package main

import (
	"fmt"
	"os"
	"runtime"
	"unicode/utf8"

	qt "github.com/mappu/miqt/qt6"
)

const appName = "go-gui-qt"

type tab int

const (
	tabHome tab = iota
	tabNotes
	tabSettings
)

const (
	headerStyle  = ".QWidget { background-color: palette(alternate-base); }"
	titleStyle   = "font-size: 18px; font-weight: 600;"
	ledeStyle    = "color: palette(placeholder-text);"
	badgeStyle   = "background-color: palette(base); border: 1px solid palette(mid); color: palette(placeholder-text); padding: 3px 8px;"
	headingStyle = "font-size: 16px; font-weight: 600;"
	statusStyle  = "background-color: palette(alternate-base); border-top: 1px solid palette(mid); color: palette(placeholder-text); padding: 6px 16px;"
)

func init() {
	// Qt's GUI has to run on the process main thread, which macOS enforces.
	runtime.LockOSThread()
}

func formatCount(count int) string {
	return fmt.Sprintf("Count: %d", count)
}

func formatPreview(note string) string {
	if note == "" {
		return "Preview: (empty)"
	}

	return "Preview: " + note
}

func formatStatus(current tab, count int, note string, areNotificationsOn bool) string {
	switch current {
	case tabNotes:
		return fmt.Sprintf("Notes · %d characters", utf8.RuneCountInString(note))
	case tabSettings:
		if areNotificationsOn {
			return "Settings · Notifications on"
		}

		return "Settings · Notifications off"
	default:
		return fmt.Sprintf("Home · Count %d", count)
	}
}

func newStyledLabel(text string, styleSheet string) *qt.QLabel {
	label := qt.NewQLabel3(text)
	label.SetStyleSheet(styleSheet)

	return label
}

func newPage(heading string) (*qt.QWidget, *qt.QVBoxLayout) {
	page := qt.NewQWidget2()
	layout := qt.NewQVBoxLayout(page)
	layout.AddWidget(newStyledLabel(heading, headingStyle).QWidget)

	return page, layout
}

func newButtonRow(buttons ...*qt.QPushButton) *qt.QLayout {
	row := qt.NewQHBoxLayout2()

	for _, button := range buttons {
		row.AddWidget(button.QWidget)
	}

	row.AddStretch()

	return row.QLayout
}

type workspace struct {
	root            *qt.QWidget
	tabs            *qt.QTabWidget
	countLabel      *qt.QLabel
	status          *qt.QLabel
	noteEdit        *qt.QLineEdit
	nameEdit        *qt.QLineEdit
	incrementButton *qt.QPushButton
	applyButton     *qt.QPushButton
}

func newWorkspace() *workspace {
	count := 0
	note := ""
	areNotificationsOn := true
	currentTab := tabHome

	countLabel := qt.NewQLabel3(formatCount(count))
	preview := qt.NewQLabel3(formatPreview(note))
	status := newStyledLabel(formatStatus(currentTab, count, note, areNotificationsOn), statusStyle)

	refreshStatus := func() {
		status.SetText(formatStatus(currentTab, count, note, areNotificationsOn))
	}

	incrementButton := qt.NewQPushButton3("Increment")
	incrementButton.OnClicked(func() {
		count++
		countLabel.SetText(formatCount(count))
		refreshStatus()
	})

	resetButton := qt.NewQPushButton3("Reset")
	resetButton.OnClicked(func() {
		count = 0
		countLabel.SetText(formatCount(count))
		refreshStatus()
	})

	description := qt.NewQLabel3("A desktop shell with tabs, a content pane, and a few working controls.")
	description.SetWordWrap(true)

	home, homeLayout := newPage("Home")
	homeLayout.AddWidget(description.QWidget)
	homeLayout.AddWidget(countLabel.QWidget)
	homeLayout.AddLayout(newButtonRow(incrementButton, resetButton))
	homeLayout.AddStretch()

	noteEdit := qt.NewQLineEdit2()
	noteEdit.SetPlaceholderText("Write a note")
	noteEdit.OnTextChanged(func(text string) {
		note = text
		preview.SetText(formatPreview(note))
		refreshStatus()
	})

	noteLabel := qt.NewQLabel3("Note")
	noteLabel.SetBuddy(noteEdit.QWidget)

	clearButton := qt.NewQPushButton3("Clear")
	clearButton.OnClicked(func() {
		noteEdit.SetText("")
	})

	notes, notesLayout := newPage("Notes")
	notesLayout.AddWidget(noteLabel.QWidget)
	notesLayout.AddWidget(noteEdit.QWidget)
	notesLayout.AddWidget(preview.QWidget)
	notesLayout.AddLayout(newButtonRow(clearButton))
	notesLayout.AddStretch()

	notificationsCheck := qt.NewQCheckBox3("Notifications")
	notificationsCheck.SetChecked(areNotificationsOn)
	notificationsCheck.OnToggled(func(isChecked bool) {
		areNotificationsOn = isChecked
		refreshStatus()
	})

	nameEdit := qt.NewQLineEdit3(appName)
	nameEdit.OnTextChanged(func(string) {
		refreshStatus()
	})

	nameLabel := qt.NewQLabel3("Display name")
	nameLabel.SetBuddy(nameEdit.QWidget)

	applyButton := qt.NewQPushButton3("Apply")
	applyButton.OnClicked(func() {
		status.SetText("Settings · Saved as " + nameEdit.Text())
	})

	settings, settingsLayout := newPage("Settings")
	settingsLayout.AddWidget(notificationsCheck.QWidget)
	settingsLayout.AddWidget(nameLabel.QWidget)
	settingsLayout.AddWidget(nameEdit.QWidget)
	settingsLayout.AddLayout(newButtonRow(applyButton))
	settingsLayout.AddStretch()

	tabs := qt.NewQTabWidget2()
	tabs.AddTab(home, "Home")
	tabs.AddTab(notes, "Notes")
	tabs.AddTab(settings, "Settings")
	tabs.OnCurrentChanged(func(index int) {
		currentTab = tab(index)
		refreshStatus()
	})

	titles := qt.NewQVBoxLayout2()
	titles.AddWidget(newStyledLabel(appName, titleStyle).QWidget)
	titles.AddWidget(newStyledLabel("Starter workspace", ledeStyle).QWidget)

	header := qt.NewQWidget2()
	header.SetStyleSheet(headerStyle)

	headerLayout := qt.NewQHBoxLayout(header)
	headerLayout.AddLayout(titles.QLayout)
	headerLayout.AddStretch()
	headerLayout.AddWidget3(newStyledLabel("starter", badgeStyle).QWidget, 0, qt.AlignVCenter)

	root := qt.NewQWidget2()
	rootLayout := qt.NewQVBoxLayout(root)
	rootLayout.SetContentsMargins(0, 0, 0, 0)
	rootLayout.SetSpacing(0)
	rootLayout.AddWidget(header)
	rootLayout.AddWidget2(tabs.QWidget, 1)
	rootLayout.AddWidget(status.QWidget)

	return &workspace{
		root:            root,
		tabs:            tabs,
		countLabel:      countLabel,
		status:          status,
		noteEdit:        noteEdit,
		nameEdit:        nameEdit,
		incrementButton: incrementButton,
		applyButton:     applyButton,
	}
}

func main() {
	qt.NewQApplication(os.Args)

	window := qt.NewQMainWindow2()
	window.SetWindowTitle(appName)
	window.SetCentralWidget(newWorkspace().root)
	window.Resize(720, 480)
	window.Show()

	os.Exit(qt.QApplication_Exec())
}
