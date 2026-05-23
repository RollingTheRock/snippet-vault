import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSnippetStore = defineStore('snippets', () => {
  const snippets = ref([])
  const selectedId = ref(null)

  const selectedSnippet = computed(() =>
    snippets.value.find(s => s.id === selectedId.value) || null
  )

  async function loadSnippets() {
    snippets.value = await window.electronAPI.getSnippets()
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
  }

  return {
    snippets, selectedId, selectedSnippet,
    loadSnippets, createSnippet, updateSnippet, deleteSnippet, searchSnippets
  }
})
