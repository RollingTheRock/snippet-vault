<template>
  <div class="code-editor-wrapper">
    <div class="editor-container" :class="{ focused: isFocused }">
      <CodeMirrorEditor
        v-model="modelValueProxy"
        :language="language"
        :isDark="isDark"
        :placeholder="placeholder"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import CodeMirrorEditor from './CodeMirrorEditor.vue'

const props = defineProps({
  modelValue: String,
  language: String,
  placeholder: String,
  isDark: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const isFocused = ref(false)

const modelValueProxy = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
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

/* ── Dark mode overrides ── */
[data-theme="dark"] .editor-container {
  background: linear-gradient(180deg, #2c2c2e 0%, #252527 100%);
}
</style>
