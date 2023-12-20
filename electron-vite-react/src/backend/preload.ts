import { ipcRenderer, contextBridge } from "electron";

declare global {
  interface Window {
    api: typeof api;
  }
}

const api = {
  dev: {
    example() {
      return ipcRenderer.invoke("example");
    },
  },
};

contextBridge.exposeInMainWorld("api", api);
