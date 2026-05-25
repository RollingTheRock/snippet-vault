const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  windowType: 'mainManager',

  // Snippets
  getSnippets: () => ipcRenderer.invoke('snippets:getAll'),
  getRecentSnippets: (limit) => ipcRenderer.invoke('snippets:getRecent', limit),
  getFrequentSnippets: (limit) => ipcRenderer.invoke('snippets:getFrequent', limit),
  getSnippetsByTag: (tagId) => ipcRenderer.invoke('snippets:getByTag', tagId),
  searchSnippets: (query) => ipcRenderer.invoke('snippets:search', query),
  createSnippet: (data) => ipcRenderer.invoke('snippets:create', data),
  updateSnippet: (id, data) => ipcRenderer.invoke('snippets:update', id, data),
  deleteSnippet: (id) => ipcRenderer.invoke('snippets:delete', id),
  copySnippet: (content, snippetId) => ipcRenderer.invoke('snippets:copyToClipboard', content, snippetId),
  getSnippetTags: (id) => ipcRenderer.invoke('snippets:getTags', id),
  setSnippetTags: (id, tagIds) => ipcRenderer.invoke('snippets:setTags', id, tagIds),
  exportSnippets: () => ipcRenderer.invoke('snippets:export'),
  importSnippets: () => ipcRenderer.invoke('snippets:import'),

  // Tags
  getTags: () => ipcRenderer.invoke('tags:getAll'),
  createTag: (data) => ipcRenderer.invoke('tags:create', data),
  updateTag: (id, data) => ipcRenderer.invoke('tags:update', id, data),
  deleteTag: (id) => ipcRenderer.invoke('tags:delete', id),

  // Notes
  getNotes: () => ipcRenderer.invoke('notes:getAll'),
  getNoteById: (id) => ipcRenderer.invoke('notes:getById', id),
  searchNotes: (query) => ipcRenderer.invoke('notes:search', query),
  createNote: (data) => ipcRenderer.invoke('notes:create', data),
  updateNote: (id, data) => ipcRenderer.invoke('notes:update', id, data),
  deleteNote: (id) => ipcRenderer.invoke('notes:delete', id),
  getNoteTags: (id) => ipcRenderer.invoke('notes:getTags', id),
  setNoteTags: (id, tagIds) => ipcRenderer.invoke('notes:setTags', id, tagIds),
  getNotesByTag: (tagId) => ipcRenderer.invoke('notes:getByTag', tagId),

  // Window
  showMainManager: () => ipcRenderer.invoke('window:showMainManager'),
  toggleQuickLaunch: () => ipcRenderer.invoke('quicklaunch:toggle'),
  openPreview: (content, language) => ipcRenderer.invoke('preview:open', content, language),

  // Events
  onShortcutsTriggered: (callback) => ipcRenderer.on('shortcuts:quickLaunchTriggered', callback),
  onSnippetsUpdated: (callback) => ipcRenderer.on('snippets:updated', callback),

  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
})
