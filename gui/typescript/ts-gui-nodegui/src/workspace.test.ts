import { expect, test } from 'bun:test'

import { describeStatus, type Workspace } from './workspace'

const notesWorkspace: Workspace = {
  tab: 'notes',
  count: 0,
  note: '',
  areNotificationsOn: true,
  displayName: 'ts-gui-nodegui',
  isSaved: false
}

test.each([
  ['', 0],
  ['é', 1],
  ['😀', 1],
  ['e\u0301', 2],
  ['é😀', 2]
])('notes status counts %p as %p code points', (note, count) => {
  expect(describeStatus({ ...notesWorkspace, note })).toBe(`Notes · ${count} characters`)
})

test('saved status takes precedence over the settings status', () => {
  const saved: Workspace = { ...notesWorkspace, tab: 'settings', isSaved: true }

  expect(describeStatus(saved)).toBe('Settings · Saved as ts-gui-nodegui')
  expect(describeStatus({ ...saved, isSaved: false })).toBe('Settings · Notifications on')
})
