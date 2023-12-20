import { join } from "node:path";
import { BrowserWindow, app, ipcMain } from "electron/main";
import isDev from "electron-is-dev";

const port = process.env.PORT ?? 3000;
const width = 800;
const height = 600;

const createWindow = () => {
  const window = new BrowserWindow({
    width,
    height,
    frame: true,
    show: true,
    resizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  const url = isDev ? `http://localhost:${port}` : join(__dirname, "../src/out/index.html");

  if (isDev) {
    window.loadURL(url);
  } else {
    window.loadFile(url);
  }

  ipcMain.on("close", () => {
    window.close();
  });

  // window.webContents.openDevTools();
  ipcMain.handle("openDevTools", () => {
    window.webContents.openDevTools();
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
