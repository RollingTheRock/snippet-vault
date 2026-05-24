import { reactive } from 'vue'

let idCounter = 0

const toasts = reactive([])

export function useToast() {
  function show(message, options = {}) {
    const id = ++idCounter
    const toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 2500,
      icon: options.icon
    }
    toasts.push(toast)

    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id)
      }, toast.duration)
    }

    return id
  }

  function success(message, options = {}) {
    return show(message, { ...options, type: 'success', icon: 'check' })
  }

  function error(message, options = {}) {
    return show(message, { ...options, type: 'error', icon: 'x' })
  }

  function remove(id) {
    const idx = toasts.findIndex(t => t.id === id)
    if (idx >= 0) toasts.splice(idx, 1)
  }

  return { toasts, show, success, error, remove }
}
