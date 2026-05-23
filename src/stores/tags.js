import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useTagStore = defineStore('tags', () => {
  const tags = ref([])

  async function loadTags() {
    tags.value = await window.electronAPI.getTags()
  }

  async function createTag(data) {
    const tag = await window.electronAPI.createTag(data)
    if (tag) tags.value.push(tag)
    return tag
  }

  return { tags, loadTags, createTag }
})
