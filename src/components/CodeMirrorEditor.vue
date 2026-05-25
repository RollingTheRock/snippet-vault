<template>
  <div ref="editorRef" class="cm-editor-wrapper" />
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { EditorView, keymap, lineNumbers, highlightActiveLineGutter } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { bracketMatching, syntaxHighlighting, indentOnInput } from '@codemirror/language'
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search'
import { closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete'

const props = defineProps({
  modelValue: { type: String, default: '' },
  language: { type: String, default: 'text' },
  isDark: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let view = null

// Compartments for dynamic reconfiguration
const languageCompartment = new Compartment()
const themeCompartment = new Compartment()
const placeholderCompartment = new Compartment()

// ── Theme: Light ──
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: '#1d1d1f',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontSize: '13px',
    lineHeight: '1.7'
  },
  '.cm-content': {
    padding: '14px 16px',
    caretColor: '#1d1d1f'
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
    color: '#c7c7cc',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontSize: '12.5px',
    lineHeight: '1.7',
    padding: '14px 0'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#8e8e93'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(0, 113, 227, 0.04)'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(37, 99, 235, 0.15) !important'
  },
  '.cm-cursor': {
    borderLeftColor: '#1d1d1f'
  }
}, { dark: false })

// ── Theme: Dark ──
const darkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'transparent',
    color: '#f5f5f7',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontSize: '13px',
    lineHeight: '1.7'
  },
  '.cm-content': {
    padding: '14px 16px',
    caretColor: '#f5f5f7'
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: 'none',
    color: '#636366',
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
    fontSize: '12.5px',
    lineHeight: '1.7',
    padding: '14px 0'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent',
    color: '#a1a1a6'
  },
  '.cm-activeLine': {
    backgroundColor: 'rgba(90, 200, 250, 0.06)'
  },
  '.cm-selectionBackground': {
    backgroundColor: 'rgba(90, 200, 250, 0.2) !important'
  },
  '.cm-cursor': {
    borderLeftColor: '#f5f5f7'
  }
}, { dark: true })

// ── Highlight styles ──
import { HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

const lightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#d73a49' },
  { tag: tags.string, color: '#032f62' },
  { tag: tags.comment, color: '#6a737d', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#6f42c1' },
  { tag: tags.number, color: '#005cc5' },
  { tag: tags.operator, color: '#d73a49' },
  { tag: tags.punctuation, color: '#1d1d1f' },
  { tag: tags.propertyName, color: '#005cc5' },
  { tag: tags.className, color: '#6f42c1' },
  { tag: tags.typeName, color: '#6f42c1' },
  { tag: tags.tagName, color: '#22863a' },
  { tag: tags.attributeName, color: '#6f42c1' },
  { tag: tags.attributeValue, color: '#032f62' },
  { tag: tags.bool, color: '#005cc5' },
  { tag: tags.null, color: '#005cc5' },
  { tag: tags.unit, color: '#005cc5' },
  { tag: tags.heading, color: '#1d1d1f', fontWeight: 'bold' },
  { tag: tags.link, color: '#0366d6' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' }
])

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: '#ff7b72' },
  { tag: tags.string, color: '#a5d6ff' },
  { tag: tags.comment, color: '#8b949e', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#d2a8ff' },
  { tag: tags.number, color: '#79c0ff' },
  { tag: tags.operator, color: '#ff7b72' },
  { tag: tags.punctuation, color: '#c9d1d9' },
  { tag: tags.propertyName, color: '#79c0ff' },
  { tag: tags.className, color: '#d2a8ff' },
  { tag: tags.typeName, color: '#d2a8ff' },
  { tag: tags.tagName, color: '#7ee787' },
  { tag: tags.attributeName, color: '#d2a8ff' },
  { tag: tags.attributeValue, color: '#a5d6ff' },
  { tag: tags.bool, color: '#79c0ff' },
  { tag: tags.null, color: '#79c0ff' },
  { tag: tags.unit, color: '#79c0ff' },
  { tag: tags.heading, color: '#f0f6fc', fontWeight: 'bold' },
  { tag: tags.link, color: '#58a6ff' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strong, fontWeight: 'bold' }
])

// ── Language loader ──
const langMap = {
  javascript: () => import('@codemirror/lang-javascript').then(m => m.javascript()),
  typescript: () => import('@codemirror/lang-javascript').then(m => m.javascript({ typescript: true })),
  html: () => import('@codemirror/lang-html').then(m => m.html()),
  css: () => import('@codemirror/lang-css').then(m => m.css()),
  markdown: () => import('@codemirror/lang-markdown').then(m => m.markdown()),
  python: () => import('@codemirror/lang-python').then(m => m.python()),
  json: () => import('@codemirror/lang-json').then(m => m.json()),
  sql: () => import('@codemirror/lang-sql').then(m => m.sql()),
  java: () => import('@codemirror/lang-java').then(m => m.java()),
  cpp: () => import('@codemirror/lang-cpp').then(m => m.cpp()),
  php: () => import('@codemirror/lang-php').then(m => m.php()),
  vue: () => import('@codemirror/lang-html').then(m => m.html()),
  go: () => import('@codemirror/lang-go').then(m => m.go()),
  rust: () => import('@codemirror/lang-rust').then(m => m.rust()),
  csharp: () => import('@codemirror/lang-cpp').then(m => m.cpp())
}

async function loadLanguage(lang) {
  const loader = langMap[lang]
  if (loader) {
    try {
      return await loader()
    } catch (e) {
      console.warn(`Failed to load language ${lang}:`, e)
    }
  }
  return []
}

// ── Placeholder ──
function createPlaceholder(text) {
  return EditorView.theme({
    '.cm-placeholder': {
      color: '#c7c7cc',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace",
      fontSize: '13px'
    }
  })
}

// ── Init ──
async function initEditor() {
  if (!editorRef.value) return

  const langExt = await loadLanguage(props.language)
  const themeExt = props.isDark ? darkTheme : lightTheme
  const highlightExt = syntaxHighlighting(props.isDark ? darkHighlight : lightHighlight)

  const extensions = [
    lineNumbers(),
    highlightActiveLineGutter(),
    history(),
    bracketMatching(),
    closeBrackets(),
    indentOnInput(),
    highlightSelectionMatches(),
    keymap.of([
      ...defaultKeymap,
      ...historyKeymap,
      ...searchKeymap,
      ...closeBracketsKeymap
    ]),
    themeCompartment.of(themeExt),
    languageCompartment.of(langExt),
    highlightExt,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit('update:modelValue', update.state.doc.toString())
      }
      if (update.focusChanged) {
        emit(update.view.hasFocus ? 'focus' : 'blur')
      }
    }),
    EditorView.editable.of(!props.readonly)
  ]

  if (props.placeholder) {
    extensions.push(createPlaceholder(props.placeholder))
  }

  const state = EditorState.create({
    doc: props.modelValue,
    extensions
  })

  view = new EditorView({
    state,
    parent: editorRef.value
  })
}

// ── Reconfigure ──
async function reconfigureLanguage() {
  if (!view) return
  const langExt = await loadLanguage(props.language)
  view.dispatch({ effects: languageCompartment.reconfigure(langExt) })
}

function reconfigureTheme() {
  if (!view) return
  const themeExt = props.isDark ? darkTheme : lightTheme
  const highlightExt = syntaxHighlighting(props.isDark ? darkHighlight : lightHighlight)
  view.dispatch({
    effects: [
      themeCompartment.reconfigure(themeExt),
      // Note: syntaxHighlighting cannot be reconfigured via compartment easily,
      // we handle it by recreating the editor for theme switches
    ]
  })
}

// ── Lifecycle ──
onMounted(() => {
  initEditor()
})

onUnmounted(() => {
  if (view) {
    view.destroy()
    view = null
  }
})

// ── Watchers ──
watch(() => props.language, () => {
  reconfigureLanguage()
})

watch(() => props.isDark, () => {
  // Recreate editor on theme switch to apply highlight style
  if (view) {
    const doc = view.state.doc.toString()
    view.destroy()
    initEditor().then(() => {
      if (view) {
        view.dispatch({
          changes: { from: 0, to: view.state.doc.length, insert: doc }
        })
      }
    })
  }
})

// Sync external modelValue to editor (only if editor is not focused to avoid cursor jump)
watch(() => props.modelValue, (newVal) => {
  if (view && !view.hasFocus && newVal !== view.state.doc.toString()) {
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: newVal },
      selection: { anchor: 0 }
    })
  }
})
</script>

<style scoped>
.cm-editor-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.cm-editor-wrapper :deep(.cm-editor) {
  height: 100%;
  outline: none;
}
.cm-editor-wrapper :deep(.cm-scroller) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.7;
}
.cm-editor-wrapper :deep(.cm-gutters) {
  min-width: 44px;
  text-align: right;
}
</style>
