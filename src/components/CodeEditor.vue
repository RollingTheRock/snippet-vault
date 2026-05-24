<template>
  <div class="code-editor-wrapper">
    <div class="editor-container" :class="{ focused: isFocused }">
      <div class="line-numbers" v-if="showLineNumbers">
        <div
          v-for="n in lineCount"
          :key="n"
          class="line-number"
          :class="{ active: activeLine === n }"
        >{{ n }}</div>
      </div>

      <div class="editor-body" ref="editorBodyRef">
        <div
          class="highlight-layer"
          ref="highlightRef"
          v-html="highlightedHtml"
          aria-hidden="true"
        />

        <textarea
          ref="textareaRef"
          :value="modelValue"
          @input="onInput"
          @focus="isFocused = true"
          @blur="isFocused = false"
          @keydown="onKeydown"
          @scroll="syncScroll"
          @click="syncScroll"
          @selectionchange="onSelectionChange"
          class="code-textarea"
          :placeholder="placeholder"
          spellcheck="false"
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { useHighlighter } from '../composables/useHighlighter.js'

const props = defineProps({
  modelValue: String,
  language: String,
  placeholder: String,
  showLineNumbers: { type: Boolean, default: true }
})
const emit = defineEmits(['update:modelValue'])

const { highlight } = useHighlighter()
const isFocused = ref(false)
const textareaRef = ref(null)
const highlightRef = ref(null)
const editorBodyRef = ref(null)
const activeLine = ref(1)

const highlightedHtml = computed(() => {
  const code = props.modelValue || ''
  return highlight(code, props.language)
})

const lineCount = computed(() => {
  if (!props.modelValue) return 1
  return props.modelValue.split('\n').length
})

function onInput(e) {
  emit('update:modelValue', e.target.value)
  updateActiveLine()
}

function updateActiveLine() {
  const textarea = textareaRef.value
  if (!textarea) return
  const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart)
  activeLine.value = (textBeforeCursor.match(/\n/g) || []).length + 1
}

function onSelectionChange() {
  updateActiveLine()
}

function syncScroll() {
  if (highlightRef.value && textareaRef.value) {
    highlightRef.value.scrollTop = textareaRef.value.scrollTop
    highlightRef.value.scrollLeft = textareaRef.value.scrollLeft
  }
}

function onKeydown(e) {
  if (e.key === 'Tab') {
    e.preventDefault()
    const textarea = e.target
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const value = textarea.value

    if (e.shiftKey) {
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const lineEnd = value.indexOf('\n', start)
      const before = value.substring(0, lineStart)
      const after = value.substring(lineEnd === -1 ? value.length : lineEnd)
      const line = value.substring(lineStart, lineEnd === -1 ? value.length : lineEnd)
      if (line.startsWith('  ')) {
        const newValue = before + line.slice(2) + after
        emit('update:modelValue', newValue)
        nextTick(() => {
          textarea.selectionStart = start - 2
          textarea.selectionEnd = end - 2
        })
      }
    } else {
      const newValue = value.substring(0, start) + '  ' + value.substring(end)
      emit('update:modelValue', newValue)
      nextTick(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2
      })
    }
  }
}

watch(() => props.modelValue, () => {
  nextTick(() => syncScroll())
})
</script>

<style scoped>
.code-editor-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.editor-container {
  flex: 1;
  display: flex;
  background: linear-gradient(180deg, #fafafc 0%, #f5f5f7 100%);
  border: 0.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  box-shadow: var(--inset-sunken);
}

.editor-container.focused {
  border-color: var(--accent-blue);
  box-shadow: 0 0 0 2.5px var(--accent-blue-bg), var(--inset-sunken);
}

.line-numbers {
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #f0f0f2 0%, #e8e8ec 100%);
  padding: 14px 0;
  border-right: 0.5px solid var(--border-subtle);
  user-select: none;
  overflow: hidden;
  min-width: 44px;
  text-align: right;
}

.line-number {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 12.5px;
  line-height: 1.7;
  color: #c7c7cc;
  padding: 0 10px;
  transition: color 0.15s ease;
  font-variant-numeric: tabular-nums;
}

.line-number.active {
  color: #8e8e93;
}

.editor-body {
  flex: 1;
  position: relative;
  min-width: 0;
  overflow: hidden;
}

.highlight-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 14px 16px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.7;
  overflow: auto;
  pointer-events: none;
  user-select: none;
  white-space: pre;
  tab-size: 2;
  color: var(--text-primary);
  z-index: 1;
}

.highlight-layer :deep(pre) {
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace !important;
  font-size: 13px !important;
  line-height: 1.7 !important;
  white-space: pre !important;
  tab-size: 2 !important;
}

.highlight-layer :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace !important;
  font-size: 13px !important;
  line-height: 1.7 !important;
  background: transparent !important;
}

.highlight-layer :deep(.line) {
  display: block;
  min-height: calc(13px * 1.7);
}

.code-textarea {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  padding: 14px 16px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.7;
  overflow: auto;
  color: transparent;
  caret-color: var(--text-primary);
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  white-space: pre;
  tab-size: 2;
  z-index: 2;
}

.code-textarea::placeholder {
  color: #c7c7cc;
}

.code-textarea::-webkit-scrollbar,
.highlight-layer::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}

.code-textarea::-webkit-scrollbar-track,
.highlight-layer::-webkit-scrollbar-track {
  background: transparent;
}

.code-textarea::-webkit-scrollbar-thumb,
.highlight-layer::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
</style>
