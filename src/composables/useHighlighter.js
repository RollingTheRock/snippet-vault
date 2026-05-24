import { createHighlighter } from 'shiki'
import { ref, onMounted } from 'vue'

const highlighter = ref(null)

export function useHighlighter() {
  onMounted(async () => {
    if (!highlighter.value) {
      highlighter.value = await createHighlighter({
        themes: ['github-light'],
        langs: ['html', 'css', 'javascript', 'typescript', 'vue', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'sql', 'shell', 'ruby', 'json']
      })
    }
  })

  function highlight(code, lang) {
    if (!highlighter.value) return `<pre style="margin:0"><code>${escapeHtml(code)}</code></pre>`
    try {
      return highlighter.value.codeToHtml(code, {
        lang: lang || 'text',
        theme: 'github-light'
      })
    } catch {
      return `<pre style="margin:0"><code>${escapeHtml(code)}</code></pre>`
    }
  }

  return { highlight }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
