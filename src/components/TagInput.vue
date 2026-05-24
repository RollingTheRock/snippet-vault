<template>
  <div class="tag-input" ref="inputRef">
    <div class="tag-list">
      <TransitionGroup name="tag-pop" tag="span" class="tag-group">
        <span
          v-for="tag in modelValue"
          :key="tag.id"
          class="tag"
          :style="{ background: tag.color + '10', color: tag.color, borderColor: tag.color + '22' }"
        >
          <span class="tag-dot" :style="{ background: tag.color }" />
          {{ tag.name }}
          <span class="tag-remove" @click.stop="removeTag(tag.id)">
            <AppIcon name="x" :size="10" />
          </span>
        </span>
      </TransitionGroup>
      <input
        ref="newTagInput"
        v-model="newTag"
        @keydown.enter.prevent="addTag"
        @keydown.esc="newTag = ''; blurInput()"
        @focus="isFocused = true"
        @blur="isFocused = false"
        class="tag-new-input"
        :class="{ focused: isFocused }"
        placeholder="添加标签..."
      />
    </div>
    <Transition name="popup">
      <div class="tag-suggestions" v-if="suggestions.length > 0">
        <div
          v-for="(tag, index) in suggestions"
          :key="tag.id"
          class="tag-suggestion"
          :style="{ animationDelay: `${index * 30}ms` }"
          @mousedown.prevent="selectTag(tag)"
        >
          <span class="tag-suggestion-dot" :style="{ background: tag.color }" />
          <span class="tag-suggestion-name">{{ tag.name }}</span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTagStore } from '../stores/tags.js'
import AppIcon from './AppIcon.vue'

const props = defineProps({ modelValue: Array })
const emit = defineEmits(['update:modelValue'])

const tagStore = useTagStore()
const newTag = ref('')
const isFocused = ref(false)
const newTagInput = ref(null)
const inputRef = ref(null)

const suggestions = computed(() => {
  if (!newTag.value.trim()) return []
  return tagStore.tags.filter(t =>
    t.name.toLowerCase().includes(newTag.value.toLowerCase()) &&
    !props.modelValue.some(vt => vt.id === t.id)
  )
})

function blurInput() {
  newTagInput.value?.blur()
}

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
  newTag.value = ''
}

function removeTag(tagId) {
  emit('update:modelValue', props.modelValue.filter(t => t.id !== tagId))
}

function randomColor() {
  const colors = ['#0071e3', '#af52de', '#34c759', '#ff9500', '#ff3b30', '#5ac8fa', '#ff2d55']
  return colors[Math.floor(Math.random() * colors.length)]
}
</script>

<style scoped>
.tag-input {
  position: relative;
  flex: 1;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;
}
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 9px 2px 7px;
  border-radius: 20px;
  font-size: 11.5px;
  font-weight: 500;
  border: 0.5px solid;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: default;
}
.tag:hover {
  transform: translateY(-0.5px);
  box-shadow: var(--shadow-xs);
}
.tag-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tag-remove {
  cursor: pointer;
  opacity: 0.35;
  display: inline-flex;
  align-items: center;
  transition: opacity 0.15s ease;
  margin-left: 1px;
}
.tag-remove:hover {
  opacity: 0.85;
}
.tag-new-input {
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  border: 0.5px solid transparent;
  color: var(--text-primary);
  padding: 4px 9px;
  border-radius: 20px;
  font-size: 11.5px;
  outline: none;
  width: 90px;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  font-family: inherit;
  box-shadow: var(--inset-sunken);
}
.tag-new-input::placeholder {
  color: var(--text-tertiary);
}
.tag-new-input.focused {
  width: 130px;
  border-color: var(--border-color);
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  box-shadow: var(--shadow-xs);
}

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 5px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  border: 0.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 10;
  min-width: 150px;
  padding: 3px;
  overflow: hidden;
}
.tag-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 11px;
  font-size: 12.5px;
  cursor: pointer;
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  transition: background 0.15s ease;
  animation: slide-in 0.25s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}
.tag-suggestion:hover {
  background: var(--bg-secondary);
}
.tag-suggestion-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tag-suggestion-name {
  font-weight: 500;
}

@keyframes slide-in {
  0% { opacity: 0; transform: translateX(-5px); }
  100% { opacity: 1; transform: translateX(0); }
}

.tag-pop-enter-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.tag-pop-leave-active {
  transition: all 0.18s cubic-bezier(0.25, 1, 0.5, 1);
  position: absolute;
}
.tag-pop-enter-from,
.tag-pop-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

.popup-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.popup-leave-active {
  transition: all 0.15s ease;
}
.popup-enter-from,
.popup-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-3px);
}
</style>
