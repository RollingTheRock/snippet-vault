import { createHighlighter } from 'shiki'
import { ref, onMounted } from 'vue'

const highlighter = ref(null)

export function useHighlighter() {
  onMounted(async () => {
    if (!highlighter.value) {
      highlighter.value = await createHighlighter({
        themes: ['dark-plus'],
        langs: ['html', 'css', 'javascript', 'typescript', 'vue', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'sql', 'shell', 'ruby', 'json']
      })
    }
  })

  function highlight(code, lang) {
    if (!highlighter.value) return code
    try {
      return highlighter.value.codeToHtml(code, {
        lang: lang || 'text',
        theme: 'dark-plus'
      })
    } catch {
      return code
    }
  }

  return { highlight }
}
