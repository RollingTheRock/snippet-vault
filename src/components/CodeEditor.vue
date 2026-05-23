<template>
  <div class="code-editor-wrapper">
    <div v-if="preview" class="code-preview" v-html="highlightedCode" />
    <textarea
      v-else
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      class="code-textarea"
      :placeholder="placeholder"
      spellcheck="false"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHighlighter } from '../composables/useHighlighter.js'

const props = defineProps({
  modelValue: String,
  language: String,
  placeholder: String,
  preview: Boolean
})
defineEmits(['update:modelValue'])

const { highlight } = useHighlighter()

const highlightedCode = computed(() => {
  return highlight(props.modelValue || '', props.language)
})
</script>

<style scoped>
.code-editor-wrapper { flex: 1; display: flex; flex-direction: column; }
.code-textarea, .code-preview {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  padding: 16px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  border-radius: 4px;
  overflow: auto;
  color: var(--text-primary);
}
.code-textarea {
  resize: none;
  outline: none;
  color: var(--text-primary);
}
.code-preview :deep(pre) { margin: 0; background: transparent !important; }
.code-preview :deep(code) { font-family: 'Fira Code', 'Consolas', monospace; }
</style>
