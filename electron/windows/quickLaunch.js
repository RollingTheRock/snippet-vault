const { BrowserWindow, screen } = require('electron')
const path = require('path')

let quickLaunchWindow = null

function createQuickLaunchWindow() {
  if (quickLaunchWindow && !quickLaunchWindow.isDestroyed()) {
    return quickLaunchWindow
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  quickLaunchWindow = new BrowserWindow({
    width: 600,
    height: 450,
    x: Math.round((width - 600) / 2),
    y: Math.round((height - 450) / 3),
    show: false,
    frame: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    transparent: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  quickLaunchWindow.setVisibleOnAllWorkspaces(true)

  const rendererUrl = process.env.ELECTRON_RENDERER_URL || process.env.VITE_DEV_SERVER_URL
  if (rendererUrl) {
    quickLaunchWindow.loadURL(rendererUrl + '?window=quickLaunch')
  } else {
    quickLaunchWindow.loadFile(path.join(__dirname, '../../dist/index.html'), {
      query: { window: 'quickLaunch' }
    })
  }

  quickLaunchWindow.on('blur', () => {
    quickLaunchWindow.hide()
  })

  return quickLaunchWindow
}

function toggleQuickLaunchWindow() {
  if (!quickLaunchWindow || quickLaunchWindow.isDestroyed()) {
    createQuickLaunchWindow()
    quickLaunchWindow.once('ready-to-show', () => quickLaunchWindow.show())
  } else if (quickLaunchWindow.isVisible()) {
    quickLaunchWindow.hide()
  } else {
    quickLaunchWindow.show()
    quickLaunchWindow.focus()
  }
}

module.exports = { createQuickLaunchWindow, toggleQuickLaunchWindow }
