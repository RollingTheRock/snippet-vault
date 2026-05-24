import { createHighlighter } from 'shiki'
import { ref, onMounted } from 'vue'

const highlighter = ref(null)
const ready = ref(false)

export function useHighlighter() {
  onMounted(async () => {
    if (!highlighter.value) {
      highlighter.value = await createHighlighter({
        themes: ['github-light', 'github-dark'],
        langs: ['html', 'css', 'javascript', 'typescript', 'vue', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'sql', 'shell', 'ruby', 'json', 'markdown']
      })
      ready.value = true
    }
  })

  function highlight(code, lang, theme = 'github-light') {
    if (!highlighter.value) return `<pre style="margin:0"><code>${escapeHtml(code)}</code></pre>`
    try {
      let html = highlighter.value.codeToHtml(code, {
        lang: lang || 'text',
        theme: theme === 'dark' ? 'github-dark' : 'github-light'
      })
      // Shiki inserts \n between <span class="line"> tags. Since .line is display:block,
      // that creates double line breaks. Remove them.
      html = html.replace(/<\/span>\s*<span class="line">/g, '</span><span class="line">')
      return html
    } catch {
      return `<pre style="margin:0"><code>${escapeHtml(code)}</code></pre>`
    }
  }

  return { highlight, ready }
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
