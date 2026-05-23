import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// Mock electronAPI for browser dev/demo mode
if (!window.electronAPI) {
  const mockSnippets = [
    { id: 1, title: 'JS 防抖函数', content: 'function debounce(fn, delay) {\n  let timer = null;\n  return (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n}', language: 'javascript', tags: [{id:1, name:'js', color:'#4a9eff'}, {id:2, name:'utils', color:'#c586c0'}] },
    { id: 2, title: 'Flex 居中布局', content: '.center {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n}', language: 'css', tags: [{id:3, name:'css', color:'#4ec9b0'}] },
    { id: 3, title: 'Vue 表单验证', content: '<template>\n  <form @submit.prevent="handleSubmit">\n    <input v-model="email" />\n  </form>\n</template>', language: 'vue', tags: [{id:4, name:'vue', color:'#4ec9b0'}] },
    { id: 4, title: 'Python 文件读取', content: 'with open("file.txt", "r") as f:\n    content = f.read()\n    print(content)', language: 'python', tags: [] },
  ]
  const mockTags = [
    { id: 1, name: 'js', color: '#4a9eff' },
    { id: 2, name: 'utils', color: '#c586c0' },
    { id: 3, name: 'css', color: '#4ec9b0' },
    { id: 4, name: 'vue', color: '#4ec9b0' },
  ]
  window.electronAPI = {
    windowType: 'mainManager',
    getSnippets: async () => mockSnippets,
    searchSnippets: async (query) => {
      const q = query.toLowerCase()
      return mockSnippets.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some(t => t.name.toLowerCase().includes(q))
      )
    },
    createSnippet: async (data) => ({ id: Date.now(), ...data, tags: [] }),
    updateSnippet: async (id, data) => ({ id, ...data }),
    deleteSnippet: async () => true,
    copySnippet: async () => true,
    getSnippetTags: async () => [],
    setSnippetTags: async () => true,
    getTags: async () => mockTags,
    createTag: async (data) => ({ id: Date.now(), ...data }),
    updateTag: async () => true,
    deleteTag: async () => true,
    showMainManager: async () => true,
    openPreview: async () => true,
    exportSnippets: async () => true,
    importSnippets: async () => true,
  }
}

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
