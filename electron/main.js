const { app, Tray, Menu, ipcMain } = require('electron')
const path = require('path')
const { registerAllIpcHandlers } = require('./ipc')
const { showMainManagerWindow } = require('./windows/mainManager')
const { toggleQuickLaunchWindow } = require('./windows/quickLaunch')
const { createPreviewWindow } = require('./windows/preview')

let tray = null
const isWayland = process.env.XDG_SESSION_TYPE === 'wayland'

app.whenReady().then(() => {
  registerAllIpcHandlers()

  // Create tray
  tray = new Tray(path.join(__dirname, '../assets/tray-icon.png'))
  const contextMenu = Menu.buildFromTemplate([
    { label: '打开快启搜索', click: toggleQuickLaunchWindow },
    { label: '打开管理窗口', click: showMainManagerWindow },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ])
  tray.setToolTip('SnippetVault')
  tray.setContextMenu(contextMenu)

  // Tray click: left-click opens quick launch, right-click shows menu
  tray.on('click', toggleQuickLaunchWindow)

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

  // Log Wayland warning
  if (isWayland) {
    console.log('[SnippetVault] Running on Wayland. Global shortcuts are not supported. Use tray click to open quick launch.')
  }
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

app.on('activate', () => {
  showMainManagerWindow()
})
