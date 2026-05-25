<template>
  <Teleport to="body">
    <Transition name="screenshot">
      <div v-if="visible" class="screenshot-modal" @click="close">
        <div class="screenshot-panel" @click.stop>
          <div class="screenshot-header">
            <h4>导出代码图片</h4>
            <button class="screenshot-close" @click="close">
              <AppIcon name="x" :size="14" />
            </button>
          </div>

          <!-- Preview canvas -->
          <div ref="captureRef" class="capture-area" :class="{ dark: theme === 'dark' }">
            <div class="capture-window">
              <div class="capture-bar">
                <span class="capture-dot red" />
                <span class="capture-dot yellow" />
                <span class="capture-dot green" />
                <span class="capture-title">{{ title || 'untitled' }}</span>
              </div>
              <pre class="capture-code"><code>{{ code }}</code></pre>
            </div>
            <div class="capture-watermark">SnippetVault</div>
          </div>

          <!-- Controls -->
          <div class="screenshot-controls">
            <div class="control-group">
              <label>主题</label>
              <div class="theme-options">
                <button :class="{ active: theme === 'dark' }" @click="theme = 'dark'">深色</button>
                <button :class="{ active: theme === 'light' }" @click="theme = 'light'">浅色</button>
              </div>
            </div>
            <button class="btn btn-primary screenshot-download" @click="download">
              <AppIcon name="download" :size="13" />
              <span>下载 PNG</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { toPng } from 'html-to-image'
import AppIcon from './AppIcon.vue'

const visible = ref(false)
const theme = ref('dark')
const title = ref('')
const code = ref('')
const captureRef = ref(null)

function open(opts = {}) {
  title.value = opts.title || 'untitled'
  code.value = opts.code || ''
  theme.value = opts.isDark ? 'dark' : 'dark'
  visible.value = true
}

async function download() {
  if (!captureRef.value) return
  await nextTick()
  const dataUrl = await toPng(captureRef.value, { pixelRatio: 2, cacheBust: true })
  const link = document.createElement('a')
  link.download = `${title.value || 'snippet'}.png`
  link.href = dataUrl
  link.click()
}

function close() {
  visible.value = false
}

defineExpose({ open })
</script>

<style scoped>
.screenshot-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.screenshot-panel {
  width: 100%;
  max-width: 720px;
  background: linear-gradient(180deg, #ffffff 0%, #fafafc 100%);
  border-radius: var(--radius-lg);
  border: 0.5px solid var(--border-subtle);
  box-shadow: 0 24px 48px rgba(0,0,0,0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

[data-theme="dark"] .screenshot-panel {
  background: linear-gradient(180deg, #2c2c2e 0%, #1c1c1e 100%);
}

.screenshot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  box-shadow: var(--inset-divider-bottom);
}

.screenshot-header h4 {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.screenshot-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.capture-area {
  padding: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.capture-area.dark {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.capture-area.light {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
}

.capture-window {
  width: 100%;
  max-width: 560px;
  background: #1e1e1e;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}

.capture-area.light .capture-window {
  background: #ffffff;
  box-shadow: 0 20px 40px rgba(0,0,0,0.08);
}

.capture-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.capture-area.light .capture-bar {
  background: rgba(0,0,0,0.03);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

.capture-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.capture-dot.red { background: #ff5f57; }
.capture-dot.yellow { background: #ffbd2e; }
.capture-dot.green { background: #28c840; }

.capture-title {
  margin-left: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
  font-family: 'JetBrains Mono', monospace;
}

.capture-area.light .capture-title {
  color: rgba(0,0,0,0.35);
}

.capture-code {
  margin: 0;
  padding: 16px 18px;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.7;
  color: #d4d4d4;
  overflow-x: auto;
  white-space: pre;
}

.capture-area.light .capture-code {
  color: #1d1d1f;
}

.capture-watermark {
  position: absolute;
  bottom: 10px;
  right: 14px;
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  font-weight: 600;
  letter-spacing: 1px;
}

.screenshot-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  box-shadow: var(--inset-divider-top);
  gap: 14px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-group label {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
}

.theme-options {
  display: flex;
  gap: 4px;
  padding: 2px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.theme-options button {
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11.5px;
  font-weight: 500;
  border: none;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
}

.theme-options button.active {
  background: linear-gradient(180deg, #ffffff 0%, #f5f5f7 100%);
  color: var(--text-primary);
  box-shadow: var(--inset-sunken), 0 0.5px 1px rgba(0,0,0,0.03);
}

.screenshot-download {
  white-space: nowrap;
}

/* Transition */
.screenshot-enter-active {
  transition: opacity 0.15s ease;
}
.screenshot-leave-active {
  transition: opacity 0.1s ease;
}
.screenshot-enter-from,
.screenshot-leave-to {
  opacity: 0;
}
</style>
