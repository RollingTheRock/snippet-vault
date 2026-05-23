const { ipcMain } = require('electron')
const tagsRepo = require('../db/tags')

function registerTagHandlers() {
  ipcMain.handle('tags:getAll', () => tagsRepo.getAll())
  ipcMain.handle('tags:create', (_, data) => tagsRepo.create(data))
  ipcMain.handle('tags:update', (_, id, data) => tagsRepo.update(id, data))
  ipcMain.handle('tags:delete', (_, id) => tagsRepo.remove(id))
}

module.exports = { registerTagHandlers }
