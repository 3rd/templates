import { join } from 'node:path'

import { app, BrowserWindow, ipcMain } from 'electron'

import { runtimeSummaryChannel } from '../shared/ipc'
import { runtimeSummary } from './runtime'

const createWindow = () => {
  const window = new BrowserWindow({
    title: 'ts-gui-electron',
    resizable: true,
    webPreferences: {
      contextIsolation: true,
      preload: join(__dirname, '../preload/index.js')
    }
  })

  const devServerUrl = process.env['ELECTRON_RENDERER_URL']
  if (devServerUrl === undefined) {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  } else {
    window.loadURL(devServerUrl)
  }
}

app.whenReady().then(() => {
  ipcMain.handle(runtimeSummaryChannel, () => runtimeSummary(process.versions))
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
