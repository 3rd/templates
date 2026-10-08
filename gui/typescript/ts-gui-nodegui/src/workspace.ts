export type Tab = 'home' | 'notes' | 'settings'

export type Workspace = {
  tab: Tab
  count: number
  note: string
  areNotificationsOn: boolean
  displayName: string
  isSaved: boolean
}

export const describePreview = (note: string) =>
  note === '' ? 'Preview: (empty)' : `Preview: ${note}`

export const describeStatus = (workspace: Workspace) => {
  if (workspace.isSaved) return `Settings · Saved as ${workspace.displayName}`

  switch (workspace.tab) {
    case 'home': {
      return `Home · Count ${workspace.count}`
    }
    case 'notes': {
      return `Notes · ${Array.from(workspace.note).length} characters`
    }
    case 'settings': {
      return `Settings · Notifications ${workspace.areNotificationsOn ? 'on' : 'off'}`
    }
  }
}
