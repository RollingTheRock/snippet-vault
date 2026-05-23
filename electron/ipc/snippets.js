const { ipcMain, clipboard } = require('electron')
const snippetsRepo = require('../db/snippets')

function registerSnippetHandlers() {
  ipcMain.handle('snippets:getAll', () => snippetsRepo.getAll())

  ipcMain.handle('snippets:search', (_, query) => snippetsRepo.search(query))

  ipcMain.handle('snippets:create', (_, data) => {
    const snippet = snippetsRepo.create(data)
    return snippet
  })

  ipcMain.handle('snippets:update', (_, id, data) => {
    const snippet = snippetsRepo.update(id, data)
    return snippet
  })

  ipcMain.handle('snippets:delete', (_, id) => snippetsRepo.remove(id))

  ipcMain.handle('snippets:copyToClipboard', (_, content) => {
    clipboard.writeText(content)
    return true
  })

  ipcMain.handle('snippets:getTags', (_, id) => snippetsRepo.getTags(id))

  ipcMain.handle('snippets:setTags', (_, id, tagIds) => snippetsRepo.setTags(id, tagIds))
}

module.exports = { registerSnippetHandlers }
