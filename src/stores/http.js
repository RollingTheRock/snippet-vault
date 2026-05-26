import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const DEFAULT_HEADERS = [
  { key: 'Content-Type', value: 'application/json', enabled: true }
]

const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

export const useHttpStore = defineStore('http', () => {
  const method = ref('GET')
  const url = ref('')
  const headers = ref(JSON.parse(JSON.stringify(DEFAULT_HEADERS)))
  const body = ref('')
  const response = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const envVars = ref([
    { name: 'baseUrl', value: 'https://jsonplaceholder.typicode.com' }
  ])

  function addHeader(key = '', value = '', enabled = true) {
    headers.value.push({ key, value, enabled })
  }

  function removeHeader(index) {
    headers.value.splice(index, 1)
  }

  function addEnvVar(name = '', value = '') {
    envVars.value.push({ name, value })
  }

  function removeEnvVar(index) {
    envVars.value.splice(index, 1)
  }

  function replaceEnvVars(str) {
    if (!str) return str
    return str.replace(/\{\{(\w+)\}\}/g, (match, name) => {
      const found = envVars.value.find(e => e.name === name)
      return found ? found.value : match
    })
  }

  const resolvedUrl = computed(() => replaceEnvVars(url.value))
  const resolvedBody = computed(() => replaceEnvVars(body.value))
  const resolvedHeaders = computed(() => {
    const result = {}
    headers.value.forEach(h => {
      if (h.enabled && h.key) {
        result[h.key] = replaceEnvVars(h.value)
      }
    })
    return result
  })

  async function sendRequest() {
    if (!resolvedUrl.value) {
      error.value = '请输入请求 URL'
      return
    }

    loading.value = true
    error.value = null
    response.value = null

    const startTime = performance.now()

    try {
      const options = {
        method: method.value,
        headers: resolvedHeaders.value
      }

      if (['POST', 'PUT', 'PATCH'].includes(method.value) && body.value) {
        options.body = resolvedBody.value
      }

      const res = await fetch(resolvedUrl.value, options)
      const contentType = res.headers.get('content-type') || ''
      const isJson = contentType.includes('application/json')

      let bodyText = ''
      try {
        bodyText = await res.text()
      } catch {}

      const responseHeaders = {}
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      response.value = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        headers: responseHeaders,
        body: bodyText,
        bodyFormatted: isJson ? formatJson(bodyText) : bodyText,
        contentType,
        time: Math.round(performance.now() - startTime)
      }
    } catch (e) {
      error.value = e.message || '请求失败'
      response.value = null
    } finally {
      loading.value = false
    }
  }

  function reset() {
    method.value = 'GET'
    url.value = ''
    headers.value = JSON.parse(JSON.stringify(DEFAULT_HEADERS))
    body.value = ''
    response.value = null
    error.value = null
  }

  return {
    method, url, headers, body, response, loading, error, envVars,
    METHODS, resolvedUrl, resolvedBody, resolvedHeaders,
    addHeader, removeHeader, addEnvVar, removeEnvVar, replaceEnvVars,
    sendRequest, reset
  }
})

function formatJson(text) {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return text
  }
}
