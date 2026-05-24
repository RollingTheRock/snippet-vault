const { ipcMain, clipboard, dialog } = require('electron')
const fs = require('fs')
const snippetsRepo = require('../db/snippets')

function registerSnippetHandlers() {
  ipcMain.handle('snippets:getAll', () => snippetsRepo.getAll())

  ipcMain.handle('snippets:getRecent', (_, limit) => snippetsRepo.getRecent(limit))

  ipcMain.handle('snippets:getFrequent', (_, limit) => snippetsRepo.getFrequent(limit))

  ipcMain.handle('snippets:getByTag', (_, tagId) => snippetsRepo.getByTag(tagId))

  ipcMain.handle('snippets:search', (_, query) => snippetsRepo.search(query))

  ipcMain.handle('snippets:create', (_, data) => {
    const snippet = snippetsRepo.create(data)
    return snippet
  })

  ipcMain.handle('snippets:update', (_, id, data) => {
    const snippet = snippetsRepo.update(id, data)
    return snippet
  })

  ipcMain.handle('snippets:delete', (_, id) => {
    snippetsRepo.remove(id)
    return true
  })

  ipcMain.handle('snippets:copyToClipboard', (_, content, snippetId) => {
    clipboard.writeText(content || '')
    if (snippetId) {
      snippetsRepo.incrementCopyCount(snippetId)
    }
    return true
  })

  ipcMain.handle('snippets:getTags', (_, id) => snippetsRepo.getTags(id))

  ipcMain.handle('snippets:setTags', (_, id, tagIds) => snippetsRepo.setTags(id, tagIds))

  ipcMain.handle('snippets:export', async () => {
    const { filePath } = await dialog.showSaveDialog({
      defaultPath: 'snippet-vault-export.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (!filePath) return false
    const data = snippetsRepo.getAll()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
    return true
  })

  ipcMain.handle('snippets:import', async () => {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile']
    })
    if (!filePaths || filePaths.length === 0) return false
    const data = JSON.parse(fs.readFileSync(filePaths[0], 'utf-8'))
    for (const item of data) {
      snippetsRepo.create({
        title: item.title,
        content: item.content,
        language: item.language,
        description: item.description
      })
    }
    return true
  })
}

module.exports = { registerSnippetHandlers }
