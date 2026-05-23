const { BrowserWindow } = require('electron')
const path = require('path')

let mainManagerWindow = null

function createMainManagerWindow() {
  if (mainManagerWindow && !mainManagerWindow.isDestroyed()) {
    mainManagerWindow.show()
    mainManagerWindow.focus()
    return mainManagerWindow
  }

  mainManagerWindow = new BrowserWindow({
    width: 900,
    height: 650,
    minWidth: 700,
    minHeight: 500,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  const rendererUrl = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL
  if (rendererUrl) {
    mainManagerWindow.loadURL(rendererUrl)
  } else {
    mainManagerWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainManagerWindow.once('ready-to-show', () => {
    mainManagerWindow.show()
  })

  mainManagerWindow.on('close', (e) => {
    e.preventDefault()
    mainManagerWindow.hide()
  })

  return mainManagerWindow
}

function showMainManagerWindow() {
  if (!mainManagerWindow || mainManagerWindow.isDestroyed()) {
    createMainManagerWindow()
  } else {
    mainManagerWindow.show()
    mainManagerWindow.focus()
  }
}

module.exports = { createMainManagerWindow, showMainManagerWindow }
