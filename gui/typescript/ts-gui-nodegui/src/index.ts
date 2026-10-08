import {
  AlignmentFlag,
  Direction,
  QBoxLayout,
  QCheckBox,
  QIcon,
  QLabel,
  QLineEdit,
  QMainWindow,
  QPushButton,
  QTabWidget,
  QWidget
} from '@nodegui/nodegui'

import { describePreview, describeStatus, type Tab, type Workspace } from './workspace'

const APP_NAME = 'ts-gui-nodegui'

const STYLE_SHEET = `
  #header { background-color: #ecece6; border-bottom: 1px solid #d6d6cf; }
  #title { font-size: 18px; font-weight: 600; }
  #lede { color: #5c5c55; }
  #badge { background-color: #ffffff; border: 1px solid #d6d6cf; color: #5c5c55; padding: 3px 8px; }
  #heading { font-size: 16px; font-weight: 600; }
  #status { background-color: #e7e7e1; border-top: 1px solid #d6d6cf; color: #5c5c55; padding: 6px 16px; }
`

const createLabel = (text: string, objectName = '') => {
  const label = new QLabel()
  label.setText(text)
  label.setObjectName(objectName)

  return label
}

const createButton = (text: string, onClick: () => void) => {
  const button = new QPushButton()
  button.setText(text)
  button.addEventListener('clicked', onClick)

  return button
}

const createRow = (buttons: QPushButton[]) => {
  const row = new QWidget()
  const layout = new QBoxLayout(Direction.LeftToRight)
  layout.setContentsMargins(0, 0, 0, 0)
  row.setLayout(layout)

  for (const button of buttons) {
    layout.addWidget(button)
  }

  layout.addStretch()

  return row
}

const createPage = (heading: string, widgets: QWidget[]) => {
  const page = new QWidget()
  const layout = new QBoxLayout(Direction.TopToBottom)
  page.setLayout(layout)
  layout.addWidget(createLabel(heading, 'heading'))

  for (const widget of widgets) {
    layout.addWidget(widget)
  }

  layout.addStretch()

  return page
}

let workspace: Workspace = {
  tab: 'home',
  count: 0,
  note: '',
  areNotificationsOn: true,
  displayName: APP_NAME,
  isSaved: false
}

const countLabel = createLabel('')
const previewLabel = createLabel('')
const statusLabel = createLabel('', 'status')

const render = () => {
  countLabel.setText(`Count: ${workspace.count}`)
  previewLabel.setText(describePreview(workspace.note))
  statusLabel.setText(describeStatus(workspace))
}

const update = (changes: Partial<Workspace>) => {
  workspace = { ...workspace, isSaved: false, ...changes }
  render()
}

const description = createLabel(
  'A desktop shell with tabs, a content pane, and a few working controls.'
)
description.setWordWrap(true)

const homePage = createPage('Home', [
  description,
  countLabel,
  createRow([
    createButton('Increment', () => update({ count: workspace.count + 1 })),
    createButton('Reset', () => update({ count: 0 }))
  ])
])

const noteInput = new QLineEdit()
noteInput.setPlaceholderText('Write a note')
noteInput.addEventListener('textChanged', (note) => update({ note }))

const noteLabel = createLabel('Note')
noteLabel.setBuddy(noteInput)

const notesPage = createPage('Notes', [
  noteLabel,
  noteInput,
  previewLabel,
  createRow([createButton('Clear', () => noteInput.setText(''))])
])

const notifications = new QCheckBox()
notifications.setText('Notifications')
notifications.setChecked(workspace.areNotificationsOn)
notifications.addEventListener('toggled', (isChecked) => update({ areNotificationsOn: isChecked }))

const displayNameInput = new QLineEdit()
displayNameInput.setText(workspace.displayName)
displayNameInput.addEventListener('textChanged', (displayName) => update({ displayName }))

const displayNameLabel = createLabel('Display name')
displayNameLabel.setBuddy(displayNameInput)

const settingsPage = createPage('Settings', [
  notifications,
  displayNameLabel,
  displayNameInput,
  createRow([createButton('Apply', () => update({ isSaved: true }))])
])

const tabOrder: Tab[] = ['home', 'notes', 'settings']

const tabs = new QTabWidget()
tabs.addTab(homePage, new QIcon(), 'Home')
tabs.addTab(notesPage, new QIcon(), 'Notes')
tabs.addTab(settingsPage, new QIcon(), 'Settings')
tabs.addEventListener('currentChanged', (index) => update({ tab: tabOrder[index] }))

const titlesLayout = new QBoxLayout(Direction.TopToBottom)
titlesLayout.addWidget(createLabel(APP_NAME, 'title'))
titlesLayout.addWidget(createLabel('Starter workspace', 'lede'))

const header = new QWidget()
header.setObjectName('header')

const headerLayout = new QBoxLayout(Direction.LeftToRight)
header.setLayout(headerLayout)
headerLayout.addLayout(titlesLayout)
headerLayout.addStretch()
headerLayout.addWidget(createLabel('starter', 'badge'), 0, AlignmentFlag.AlignVCenter)

const root = new QWidget()
const rootLayout = new QBoxLayout(Direction.TopToBottom)
rootLayout.setContentsMargins(0, 0, 0, 0)
rootLayout.setSpacing(0)
root.setLayout(rootLayout)
rootLayout.addWidget(header)
rootLayout.addWidget(tabs, 1)
rootLayout.addWidget(statusLabel)

const mainWindow = new QMainWindow()
mainWindow.setWindowTitle(APP_NAME)
mainWindow.setStyleSheet(STYLE_SHEET)
mainWindow.setCentralWidget(root)
mainWindow.resize(720, 480)
mainWindow.show()

render()

Object.assign(globalThis, { mainWindow })
