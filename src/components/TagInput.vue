<template>
  <div class="tag-input">
    <div class="tag-list">
      <span
        v-for="tag in modelValue"
        :key="tag.id"
        class="tag"
        :style="{ background: tag.color + '22', color: tag.color, borderColor: tag.color + '44' }"
      >
        #{{ tag.name }}
        <span class="tag-remove" @click="removeTag(tag.id)">×</span>
      </span>
    </div>
    <input
      v-model="newTag"
      @keydown.enter.prevent="addTag"
      class="tag-new-input"
      placeholder="添加标签..."
    />
    <div class="tag-suggestions" v-if="suggestions.length > 0">
      <div
        v-for="tag in suggestions"
        :key="tag.id"
        class="tag-suggestion"
        @click="selectTag(tag)"
      >
        #{{ tag.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTagStore } from '../stores/tags.js'

const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])

const tagStore = useTagStore()
const newTag = ref('')

const suggestions = computed(() => {
  if (!newTag.value.trim()) return []
  return tagStore.tags.filter(t =>
    t.name.toLowerCase().includes(newTag.value.toLowerCase()) &&
    !props.modelValue.some(vt => vt.id === t.id)
  )
})

function addTag() {
  const name = newTag.value.trim()
  if (!name) return
  const existing = tagStore.tags.find(t => t.name === name)
  if (existing) {
    selectTag(existing)
  } else {
    tagStore.createTag({ name, color: randomColor() }).then(tag => {
      if (tag) selectTag(tag)
    })
  }
  newTag.value = ''
}

function selectTag(tag) {
  emit('update:modelValue', [...props.modelValue, tag])
}

function removeTag(tagId) {
  emit('update:modelValue', props.modelValue.filter(t => t.id !== tagId))
}

function randomColor() {
  const colors = ['#4a9eff', '#c586c0', '#4ec9b0', '#ce9178', '#dcdcaa', '#569cd6']
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<style scoped>
.tag-input { position: relative; }
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  border: 1px solid;
}
.tag-remove { cursor: pointer; opacity: 0.6; }
.tag-remove:hover { opacity: 1; }
.tag-new-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
  width: 120px;
}
.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  margin-top: 4px;
  z-index: 10;
  min-width: 150px;
}
.tag-suggestion {
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  color: var(--text-primary);
}
.tag-suggestion:hover { background: var(--selection-bg); }
</style>
