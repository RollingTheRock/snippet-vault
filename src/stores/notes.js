import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../api/index.js'

export const useNoteStore = defineStore('notes', () => {
  const notes = ref([])
  const selectedId = ref(null)
  const filterMode = ref('all') // 'all' | 'search' | 'tag'
  const filterTagId = ref(null)

  const selectedNote = computed(() =>
    notes.value.find(n => n.id === selectedId.value) || null
  )

  async function loadNotes() {
    notes.value = await api.getNotes()
    filterMode.value = 'all'
    filterTagId.value = null
  }

  async function loadByTag(tagId) {
    notes.value = await api.getNotesByTag(tagId)
    filterMode.value = 'tag'
    filterTagId.value = tagId
  }

  async function createNote(data) {
    const note = await api.createNote(data)
    notes.value.unshift(note)
    selectedId.value = note.id
    return note
  }

  async function updateNote(id, data) {
    const note = await api.updateNote(id, data)
    const idx = notes.value.findIndex(n => n.id === id)
    if (idx >= 0) notes.value[idx] = note
    return note
  }

  async function deleteNote(id) {
    await api.deleteNote(id)
    notes.value = notes.value.filter(n => n.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  async function searchNotes(query) {
    if (!query.trim()) {
      await loadNotes()
      return
    }
    notes.value = await api.searchNotes(query)
    filterMode.value = 'search'
    filterTagId.value = null
  }

  return {
    notes, selectedId, selectedNote, filterMode, filterTagId,
    loadNotes, loadByTag, createNote, updateNote, deleteNote, searchNotes
  }
})
