import { ref, watch } from 'vue'

const isDark = ref(false)

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  }

  function setDark(value) {
    isDark.value = value
    document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
  }

  // Initialize from system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setDark(true)
  }

  // Listen for system changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    setDark(e.matches)
  })

  return { isDark, toggle, setDark }
}
