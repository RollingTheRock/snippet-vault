<template>
  <div class="markdown-preview" :class="{ 'dark-theme': isDark }">
    <div class="markdown-body" v-html="renderedHtml" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import 'github-markdown-css/github-markdown-light.css'

const props = defineProps({
  content: String,
  isDark: { type: Boolean, default: false }
})

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
})

const renderedHtml = computed(() => {
  return md.render(props.content || '> 开始输入 Markdown...')
})
</script>

<style scoped>
.markdown-preview {
  flex: 1;
  overflow: auto;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  border: 0.5px solid var(--border-subtle);
  border-radius: var(--radius-md);
  box-shadow: var(--inset-sunken);
}

.markdown-body {
  padding: 24px 32px;
  max-width: 100%;
}

/* Override github-markdown-css for our design system */
.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4) {
  color: var(--text-primary);
  font-family: inherit;
  letter-spacing: -0.3px;
  border-bottom-color: var(--border-subtle);
}

.markdown-body :deep(p),
.markdown-body :deep(li),
.markdown-body :deep(td) {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.7;
}

.markdown-body :deep(code) {
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent-red);
}

.markdown-body :deep(pre) {
  background: linear-gradient(180deg, #f5f5f7 0%, #ececee 100%);
  border-radius: var(--radius-md);
  box-shadow: var(--inset-sunken);
  border: 0.5px solid var(--border-subtle);
}

.markdown-body :deep(pre code) {
  background: transparent;
  color: var(--text-primary);
  padding: 0;
}

.markdown-body :deep(blockquote) {
  border-left-color: var(--accent-blue);
  background: var(--selection-bg);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  padding: 8px 16px;
}

.markdown-body :deep(table th),
.markdown-body :deep(table td) {
  border-color: var(--border-subtle);
}

.markdown-body :deep(table tr:nth-child(2n)) {
  background: var(--bg-secondary);
}

.markdown-body :deep(hr) {
  border-color: var(--border-subtle);
}

.markdown-body :deep(a) {
  color: var(--accent-blue);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(img) {
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  max-width: 100%;
}

.markdown-body :deep(ul > li) {
  list-style-type: disc;
}

.markdown-body :deep(input[type="checkbox"]) {
  accent-color: var(--accent-blue);
}

/* ── Dark Theme Override ── */
.markdown-preview.dark-theme {
  background: linear-gradient(180deg, #1c1c1e 0%, #161618 100%);
  border-color: rgba(255,255,255,0.06);
}

.dark-theme .markdown-body :deep(h1),
.dark-theme .markdown-body :deep(h2),
.dark-theme .markdown-body :deep(h3),
.dark-theme .markdown-body :deep(h4) {
  color: #f5f5f7;
  border-bottom-color: rgba(255,255,255,0.08);
}

.dark-theme .markdown-body :deep(p),
.dark-theme .markdown-body :deep(li),
.dark-theme .markdown-body :deep(td) {
  color: #a1a1a6;
}

.dark-theme .markdown-body :deep(code) {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
  color: #ff453a;
}

.dark-theme .markdown-body :deep(pre) {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
  border-color: rgba(255,255,255,0.06);
}

.dark-theme .markdown-body :deep(pre code) {
  color: #f5f5f7;
}

.dark-theme .markdown-body :deep(blockquote) {
  background: rgba(0,113,227,0.08);
}

.dark-theme .markdown-body :deep(table th),
.dark-theme .markdown-body :deep(table td) {
  border-color: rgba(255,255,255,0.06);
}

.dark-theme .markdown-body :deep(table tr:nth-child(2n)) {
  background: rgba(255,255,255,0.03);
}

.dark-theme .markdown-body :deep(hr) {
  border-color: rgba(255,255,255,0.06);
}

.dark-theme .markdown-body :deep(a) {
  color: #5ac8fa;
}
</style>
