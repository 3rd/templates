import { BrowserWindow } from 'electrobun/bun'

new BrowserWindow({
  title: 'ts-gui-electrobun',
  url: 'views://mainview/index.html',
  styleMask: {
    Resizable: true
  }
})
