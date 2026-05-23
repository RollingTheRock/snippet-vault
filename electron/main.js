const { app, Tray, Menu, globalShortcut, ipcMain } = require('electron')
const path = require('path')
const { registerAllIpcHandlers } = require('./ipc')
const { showMainManagerWindow } = require('./windows/mainManager')
const { toggleQuickLaunchWindow } = require('./windows/quickLaunch')
const { createPreviewWindow } = require('./windows/preview')

let tray = null

app.whenReady().then(() => {
  registerAllIpcHandlers()

  // Create tray
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开快启搜索 (Ctrl+Shift+Space)', click: toggleQuickLaunchWindow },
    { label: '打开管理窗口', click: showMainManagerWindow },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])
  tray.setToolTip('SnippetVault')
  tray.setContextMenu(contextMenu)
  tray.on('click', showMainManagerWindow)

  // Register global shortcut (Ctrl+Shift+Space avoids Linux window-menu conflict)
  globalShortcut.register('Ctrl+Shift+Space', toggleQuickLaunchWindow)

  // Show main window on start
  showMainManagerWindow()

  // IPC: show main manager
  ipcMain.handle('window:showMainManager', () => {
    showMainManagerWindow()
  })

  // IPC: open preview
  ipcMain.handle('preview:open', (_, content, language) => {
    createPreviewWindow(content, language)
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

app.on('activate', () => {
  showMainManagerWindow()
})
