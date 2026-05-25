import * as webDb from '../db/webDb.js'

const isElectron = typeof window !== 'undefined' && !!window.electronAPI

// ── Web helpers ──
async function webCopy(content, snippetId) {
  await navigator.clipboard.writeText(content || '')
  if (snippetId) await webDb.incrementCopyCount(snippetId)
  return true
}

function webExport() {
  return new Promise((resolve) => {
    webDb.getAll().then(data => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'snippet-vault-export.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      resolve(true)
    })
  })
}

function webImport() {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,application/json'
    input.style.display = 'none'
    input.onchange = async () => {
      const file = input.files[0]
      if (!file) { resolve(false); return }
      const text = await file.text()
      try {
        const data = JSON.parse(text)
        for (const item of data) {
          await webDb.create({
            title: item.title || '',
            content: item.content || '',
            language: item.language || 'text',
            description: item.description || ''
          })
        }
        resolve(true)
      } catch {
        resolve(false)
      }
      document.body.removeChild(input)
    }
    document.body.appendChild(input)
    input.click()
  })
}

// ── API ──
export const api = {
  // ── Snippets ──
  getSnippets: () => isElectron ? window.electronAPI.getSnippets() : webDb.getAll(),
  getRecentSnippets: (limit) => isElectron ? window.electronAPI.getRecentSnippets(limit) : webDb.getRecent(limit),
  getFrequentSnippets: (limit) => isElectron ? window.electronAPI.getFrequentSnippets(limit) : webDb.getFrequent(limit),
  getSnippetsByTag: (tagId) => isElectron ? window.electronAPI.getSnippetsByTag(tagId) : webDb.getByTag(tagId),
  searchSnippets: (query) => isElectron ? window.electronAPI.searchSnippets(query) : webDb.search(query),
  createSnippet: (data) => isElectron ? window.electronAPI.createSnippet(data) : webDb.create(data),
  updateSnippet: (id, data) => isElectron ? window.electronAPI.updateSnippet(id, data) : webDb.update(id, data),
  deleteSnippet: (id) => isElectron ? window.electronAPI.deleteSnippet(id) : webDb.remove(id),
  getSnippetTags: (id) => isElectron ? window.electronAPI.getSnippetTags(id) : webDb.getTags(id),
  setSnippetTags: (id, tagIds) => isElectron ? window.electronAPI.setSnippetTags(id, tagIds) : webDb.setTags(id, tagIds),

  // ── Tags ──
  getTags: () => isElectron ? window.electronAPI.getTags() : webDb.getAllTags(),
  createTag: (data) => isElectron ? window.electronAPI.createTag(data) : webDb.createTag(data),
  updateTag: (id, data) => isElectron ? window.electronAPI.updateTag(id, data) : webDb.updateTag(id, data),
  deleteTag: (id) => isElectron ? window.electronAPI.deleteTag(id) : webDb.removeTag(id),

  // ── Notes ──
  getNotes: () => isElectron ? window.electronAPI.getNotes() : webDb.getAllNotes(),
  getNoteById: (id) => isElectron ? window.electronAPI.getNoteById(id) : webDb.getNoteById(id),
  searchNotes: (query) => isElectron ? window.electronAPI.searchNotes(query) : webDb.searchNotes(query),
  createNote: (data) => isElectron ? window.electronAPI.createNote(data) : webDb.createNote(data),
  updateNote: (id, data) => isElectron ? window.electronAPI.updateNote(id, data) : webDb.updateNote(id, data),
  deleteNote: (id) => isElectron ? window.electronAPI.deleteNote(id) : webDb.removeNote(id),
  getNoteTags: (id) => isElectron ? window.electronAPI.getNoteTags(id) : webDb.getNoteTags(id),
  setNoteTags: (id, tagIds) => isElectron ? window.electronAPI.setNoteTags(id, tagIds) : webDb.setNoteTags(id, tagIds),
  getNotesByTag: (tagId) => isElectron ? window.electronAPI.getNotesByTag(tagId) : webDb.getNotesByTag(tagId),

  // ── Platform-specific ──
  copySnippet: (content, snippetId) =>
    isElectron ? window.electronAPI.copySnippet(content, snippetId) : webCopy(content, snippetId),

  exportSnippets: () =>
    isElectron ? window.electronAPI.exportSnippets() : webExport(),

  importSnippets: () =>
    isElectron ? window.electronAPI.importSnippets() : webImport(),

  openPreview: (content, language) => {
    if (isElectron) return window.electronAPI.openPreview(content, language)
    // Web: emit an event that views can listen to
    window.dispatchEvent(new CustomEvent('snippet:preview', { detail: { content, language } }))
  },

  toggleQuickLaunch: () => {
    if (isElectron) return window.electronAPI.toggleQuickLaunch()
    // Web: no-op (quick launch is not a separate window in web)
  },

  showMainManager: () => {
    if (isElectron) return window.electronAPI.showMainManager()
    // Web: no-op (main manager is the default view)
  },

  // ── Events ──
  onShortcutsTriggered: (cb) => {
    if (isElectron) return window.electronAPI.onShortcutsTriggered(cb)
    // Web: listen for keydown
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        cb(e)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  },

  onSnippetsUpdated: (cb) => {
    if (isElectron) return window.electronAPI.onSnippetsUpdated(cb)
    // Web: no-op (stores handle their own refresh)
    return () => {}
  },

  removeAllListeners: (channel) => {
    if (isElectron) return window.electronAPI.removeAllListeners(channel)
  }
}
