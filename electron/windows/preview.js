const { BrowserWindow } = require('electron')
const path = require('path')

let previewCounter = 0
const previews = new Map()

function createPreviewWindow(content, language) {
  previewCounter++
  const win = new BrowserWindow({
    width: 520,
    height: 420,
    minWidth: 300,
    minHeight: 250,
    show: false,
    backgroundColor: '#ffffff',
    title: `预览 #${previewCounter}`,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  const isWebPreview = ['html', 'css', 'javascript', 'typescript', 'vue'].includes(language)

  if (isWebPreview) {
    const htmlContent = buildPreviewHtml(content, language)
    win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`)
  } else {
    win.loadURL(`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`)
  }

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })

  previews.set(win.id, win)

  win.on('closed', () => {
    previews.delete(win.id)
  })

  return win
}

function buildPreviewHtml(content, language) {
  if (language === 'css') {
    return `<!DOCTYPE html><html><head><style>${content}</style></head><body><div class="preview-container">CSS Preview Content</div></body></html>`
  }
  if (language === 'javascript' || language === 'typescript') {
    return `<!DOCTYPE html><html><head></head><body><div id="output"></div><script>${content}<\/script></body></html>`
  }
  return content
}

module.exports = { createPreviewWindow }
