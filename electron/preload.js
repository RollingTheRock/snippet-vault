const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  windowType: 'mainManager'
})
