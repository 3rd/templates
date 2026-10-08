import { loadFile, type ComponentHandle } from 'slint-ui'

type AppWindowProperties = {
  count_characters: (text: string) => number
}

type AppWindowConstructor = new (properties: AppWindowProperties) => unknown

const appWindowFile = new URL('../ui/app-window.slint', import.meta.url)

const isAppWindowConstructor = (value: unknown): value is AppWindowConstructor =>
  typeof value === 'function'

const isComponentHandle = (value: unknown): value is ComponentHandle =>
  typeof value === 'object' && value !== null && 'run' in value && typeof value.run === 'function'

export const loadAppWindow = () => {
  const AppWindow: unknown = Reflect.get(loadFile(appWindowFile, { quiet: false }), 'AppWindow')
  if (!isAppWindowConstructor(AppWindow)) {
    throw new Error(`${appWindowFile.pathname} must export an AppWindow component`)
  }

  return AppWindow
}

export const createAppWindow = (properties: AppWindowProperties) => {
  const AppWindow = loadAppWindow()

  const window: unknown = new AppWindow(properties)
  if (!isComponentHandle(window)) {
    throw new Error('AppWindow did not construct a Slint component')
  }

  return window
}
