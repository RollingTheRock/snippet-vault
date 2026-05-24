import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../api/index.js'

export const useTagStore = defineStore('tags', () => {
  const tags = ref([])

  async function loadTags() {
    tags.value = await api.getTags()
  }

  async function createTag(data) {
    const tag = await api.createTag(data)
    if (tag) tags.value.push(tag)
    return tag
  }

  return { tags, loadTags, createTag }
})
