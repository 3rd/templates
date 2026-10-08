import { contextBridge, ipcRenderer } from 'electron'

import { runtimeSummaryChannel } from '../shared/ipc'

const api = {
  runtimeSummary: (): Promise<string> => ipcRenderer.invoke(runtimeSummaryChannel)
}

contextBridge.exposeInMainWorld('api', api)

export type RendererApi = typeof api
