const { BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')

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
    const tempFile = path.join(os.tmpdir(), `snippet-vault-preview-${Date.now()}.html`)
    fs.writeFileSync(tempFile, htmlContent, 'utf-8')
    win.loadFile(tempFile)

    // Clean up temp file after window closes
    win.on('closed', () => {
      try { fs.unlinkSync(tempFile) } catch {}
      previews.delete(win.id)
    })
  } else {
    win.loadURL(`data:text/plain;charset=utf-8,${encodeURIComponent(content)}`)
    win.on('closed', () => {
      previews.delete(win.id)
    })
  }

  win.once('ready-to-show', () => {
    win.show()
    win.focus()
  })

  previews.set(win.id, win)
  return win
}

function buildPreviewHtml(content, language) {
  if (language === 'css') {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { margin: 0; padding: 20px; font-family: sans-serif; }
${content}
</style>
</head>
<body>
<div class="preview-container">
  <h3>CSS 预览</h3>
  <div class="demo-box">Demo Element</div>
</div>
</body>
</html>`
  }
  if (language === 'javascript' || language === 'typescript') {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
body { margin: 0; padding: 20px; font-family: sans-serif; background: #fff; }
#output { white-space: pre-wrap; font-family: monospace; }
.error { color: red; }
</style>
</head>
<body>
<div id="output"></div>
<script>
const originalLog = console.log;
const output = document.getElementById('output');
console.log = function(...args) {
  originalLog.apply(console, args);
  const line = document.createElement('div');
  line.textContent = args.join(' ');
  output.appendChild(line);
};
window.onerror = function(msg, url, line) {
  const el = document.createElement('div');
  el.className = 'error';
  el.textContent = 'Error: ' + msg;
  output.appendChild(el);
};
try {
${content}
} catch(e) {
  console.log('Error:', e.message);
}
</script>
</body>
</html>`
  }
  // html or vue
  if (!content.trim().toLowerCase().startsWith('<!doctype')) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${content}</body></html>`
  }
  return content
}

module.exports = { createPreviewWindow }
