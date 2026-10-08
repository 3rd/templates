type RuntimeVersions = {
  chrome: string
  electron: string
  node: string
}

export const runtimeSummary = (versions: RuntimeVersions) =>
  `Electron ${versions.electron} / Chromium ${versions.chrome} / Node ${versions.node}`
