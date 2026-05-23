const { app, BrowserWindow } = require('electron')
const path = require('path')

app.whenReady().then(() => {
  const win = new BrowserWindow({
    width: 900,
    height: 650,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })
  win.loadURL(process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`)
})
