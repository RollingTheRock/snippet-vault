<template>
  <div class="main-manager">
    <!-- Toolbar -->
    <div class="toolbar">
      <span class="brand">SnippetVault</span>
      <button class="btn-primary" @click="handleNew">+ 新建片段</button>
      <button class="btn-secondary" @click="handleSave" :disabled="!hasChanges">保存</button>
      <button class="btn-secondary" @click="handleDelete" :disabled="!selectedId">删除</button>
      <div style="flex:1"></div>
      <button class="btn-secondary" @click="handleExport">导出</button>
      <button class="btn-secondary" @click="handleImport">导入</button>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Left: Snippet List -->
      <div class="sidebar">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          class="search-input"
          placeholder="搜索片段..."
        />
        <SnippetList
          :snippets="snippetStore.snippets"
          :selectedId="snippetStore.selectedId"
          @select="snippetStore.selectedId = $event"
        />
      </div>

      <!-- Right: Editor -->
      <div class="editor-area" v-if="selectedSnippet">
        <input v-model="editForm.title" class="title-input" placeholder="片段标题" />
        <div class="editor-toolbar">
          <select v-model="editForm.language" class="lang-select">
            <option v-for="lang in languages" :key="lang.value" :value="lang.value">
              {{ lang.label }}
            </option>
          </select>
          <TagInput v-model="currentTags" />
        </div>
        <CodeEditor
          v-model="editForm.content"
          :language="editForm.language"
          placeholder="输入代码..."
        />
        <div class="editor-actions">
          <button class="btn-primary" @click="handlePreview">预览效果</button>
          <button class="btn-secondary" @click="handleCopy">复制代码</button>
        </div>
      </div>

      <div class="empty-state" v-else>
        <p>选择一个片段或创建新片段</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSnippetStore } from '../stores/snippets.js'
import { useTagStore } from '../stores/tags.js'
import SnippetList from '../components/SnippetList.vue'
import CodeEditor from '../components/CodeEditor.vue'
import TagInput from '../components/TagInput.vue'

const snippetStore = useSnippetStore()
const tagStore = useTagStore()
const searchQuery = ref('')
const editForm = reactive({ title: '', content: '', language: 'javascript' })
const currentTags = ref([])

const languages = [
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'vue', label: 'Vue' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'sql', label: 'SQL' },
  { value: 'shell', label: 'Shell' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'json', label: 'JSON' }
]

const selectedId = computed(() => snippetStore.selectedId)
const selectedSnippet = computed(() => snippetStore.selectedSnippet)
const hasChanges = computed(() => {
  if (!selectedSnippet.value) return false
  const tagsChanged = JSON.stringify((selectedSnippet.value.tags || []).map(t => t.id).sort()) !==
    JSON.stringify(currentTags.value.map(t => t.id).sort())
  return editForm.title !== selectedSnippet.value.title ||
    editForm.content !== selectedSnippet.value.content ||
    editForm.language !== selectedSnippet.value.language ||
    tagsChanged
})

watch(selectedSnippet, async (snippet) => {
  if (snippet) {
    editForm.title = snippet.title
    editForm.content = snippet.content
    editForm.language = snippet.language
    currentTags.value = snippet.tags || []
  }
}, { immediate: true })

async function handleSearch() {
  await snippetStore.searchSnippets(searchQuery.value)
}

async function handleNew() {
  await snippetStore.createSnippet({
    title: '未命名片段',
    content: '',
    language: 'javascript'
  })
}

async function handleSave() {
  if (!selectedId.value) return
  const snippet = await snippetStore.updateSnippet(selectedId.value, {
    title: editForm.title,
    content: editForm.content,
    language: editForm.language
  })
  await window.electronAPI.setSnippetTags(selectedId.value, currentTags.value.map(t => t.id))
  await snippetStore.loadSnippets()
}

async function handleDelete() {
  if (!selectedId.value) return
  await snippetStore.deleteSnippet(selectedId.value)
}

async function handleExport() {
  await window.electronAPI.exportSnippets()
}

async function handleImport() {
  await window.electronAPI.importSnippets()
  await snippetStore.loadSnippets()
}

async function handleCopy() {
  if (selectedSnippet.value) {
    await window.electronAPI.copySnippet(selectedSnippet.value.content)
  }
}

function handlePreview() {
  if (selectedSnippet.value) {
    window.electronAPI.openPreview(selectedSnippet.value.content, selectedSnippet.value.language)
  }
}

onMounted(() => {
  snippetStore.loadSnippets()
  tagStore.loadTags()
})
</script>

<style scoped>
.main-manager {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--bg-primary);
}
.toolbar {
  height: 44px;
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 10px;
}
.brand { color: #fff; font-weight: 600; margin-right: 10px; }
.btn-primary {
  background: var(--button-primary);
  color: #fff;
  border: none;
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 5px 14px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}
.btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
.content { display: flex; flex: 1; overflow: hidden; }
.sidebar {
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}
.search-input {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 8px 12px;
  margin: 10px;
  border-radius: 4px;
  font-size: 12px;
  outline: none;
}
.editor-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
}
.title-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-color);
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 8px 0;
  margin-bottom: 12px;
  outline: none;
}
.editor-toolbar { margin-bottom: 12px; }
.lang-select {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
}
.code-editor {
  flex: 1;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 16px;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
  resize: none;
  outline: none;
  border-radius: 4px;
}
.editor-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}
</style>
