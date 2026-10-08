const requireElement = <T extends HTMLElement>(id: string, elementType: new () => T) => {
  const element = document.getElementById(id)
  if (element === null) {
    throw new Error(`index.html is missing #${id}`)
  }
  if (!(element instanceof elementType)) {
    throw new Error(`#${id} must be a ${elementType.name}`)
  }

  return element
}

type Tab = 'home' | 'notes' | 'settings'

const countLabel = requireElement('count', HTMLElement)
const noteInput = requireElement('note', HTMLInputElement)
const preview = requireElement('preview', HTMLElement)
const notifications = requireElement('notifications', HTMLInputElement)
const displayName = requireElement('display-name', HTMLInputElement)
const status = requireElement('status', HTMLElement)
const panels: Record<Tab, HTMLElement> = {
  home: requireElement('panel-home', HTMLElement),
  notes: requireElement('panel-notes', HTMLElement),
  settings: requireElement('panel-settings', HTMLElement)
}

const tabButtons: Record<Tab, HTMLButtonElement> = {
  home: requireElement('tab-home', HTMLButtonElement),
  notes: requireElement('tab-notes', HTMLButtonElement),
  settings: requireElement('tab-settings', HTMLButtonElement)
}
const tabOrder: Tab[] = ['home', 'notes', 'settings']

let tab: Tab = 'home'
let count = 0

const render = () => {
  countLabel.textContent = String(count)
  preview.textContent = `Preview: ${noteInput.value === '' ? '(empty)' : noteInput.value}`

  if (tab === 'home') {
    status.textContent = `Home · Count ${count}`
  } else if (tab === 'notes') {
    status.textContent = `Notes · ${Array.from(noteInput.value).length} characters`
  } else {
    status.textContent = `Settings · Notifications ${notifications.checked ? 'on' : 'off'}`
  }
}

const showTab = (next: Tab) => {
  tab = next

  for (const [name, panel] of Object.entries(panels)) {
    panel.classList.toggle('hidden', name !== next)
  }

  for (const name of tabOrder) {
    const button = tabButtons[name]
    button.setAttribute('aria-selected', String(name === next))
    button.tabIndex = name === next ? 0 : -1
  }

  render()
}

for (const name of tabOrder) {
  const button = tabButtons[name]
  button.addEventListener('click', () => {
    showTab(name)
  })
  button.addEventListener('keydown', (event) => {
    const isArrowKey = event.key === 'ArrowRight' || event.key === 'ArrowLeft'
    if (!isArrowKey) return

    event.preventDefault()

    const direction = event.key === 'ArrowRight' ? 1 : -1

    const next = tabOrder[(tabOrder.indexOf(name) + direction + tabOrder.length) % tabOrder.length]
    if (next === undefined) return

    showTab(next)
    tabButtons[next].focus()
  })
}

requireElement('increment', HTMLButtonElement).addEventListener('click', () => {
  count += 1
  render()
})

requireElement('reset', HTMLButtonElement).addEventListener('click', () => {
  count = 0
  render()
})

noteInput.addEventListener('input', render)

requireElement('clear', HTMLButtonElement).addEventListener('click', () => {
  noteInput.value = ''
  render()
})

notifications.addEventListener('change', render)

requireElement('apply', HTMLButtonElement).addEventListener('click', () => {
  status.textContent = `Settings · Saved as ${displayName.value}`
})

render()
