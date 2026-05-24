import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSnippetStore = defineStore('snippets', () => {
  const snippets = ref([])
  const selectedId = ref(null)
  const filterMode = ref('all') // 'all' | 'recent' | 'frequent'
  const filterTagId = ref(null)

  const selectedSnippet = computed(() =>
    snippets.value.find(s => s.id === selectedId.value) || null
  )

  async function loadSnippets() {
    snippets.value = await window.electronAPI.getSnippets()
    filterMode.value = 'all'
    filterTagId.value = null
  }

  async function loadRecent(limit = 10) {
    snippets.value = await window.electronAPI.getRecentSnippets(limit)
    filterMode.value = 'recent'
    filterTagId.value = null
  }

  async function loadFrequent(limit = 10) {
    snippets.value = await window.electronAPI.getFrequentSnippets(limit)
    filterMode.value = 'frequent'
    filterTagId.value = null
  }

  async function loadByTag(tagId) {
    snippets.value = await window.electronAPI.getSnippetsByTag(tagId)
    filterMode.value = 'tag'
    filterTagId.value = tagId
  }

  async function createSnippet(data) {
    const snippet = await window.electronAPI.createSnippet(data)
    snippets.value.unshift(snippet)
    selectedId.value = snippet.id
    return snippet
  }

  async function updateSnippet(id, data) {
    const snippet = await window.electronAPI.updateSnippet(id, data)
    const idx = snippets.value.findIndex(s => s.id === id)
    if (idx >= 0) snippets.value[idx] = snippet
    return snippet
  }

  async function deleteSnippet(id) {
    await window.electronAPI.deleteSnippet(id)
    snippets.value = snippets.value.filter(s => s.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  async function searchSnippets(query) {
    if (!query.trim()) {
      await loadSnippets()
      return
    }
    snippets.value = await window.electronAPI.searchSnippets(query)
    filterMode.value = 'search'
    filterTagId.value = null
  }

  return {
    snippets, selectedId, selectedSnippet, filterMode, filterTagId,
    loadSnippets, loadRecent, loadFrequent, loadByTag,
    createSnippet, updateSnippet, deleteSnippet, searchSnippets
  }
})
