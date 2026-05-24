const DB_NAME = 'snippet-vault'
const DB_VERSION = 1

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = (e) => {
      const db = e.target.result

      if (!db.objectStoreNames.contains('snippets')) {
        const snippetsStore = db.createObjectStore('snippets', { keyPath: 'id', autoIncrement: true })
        snippetsStore.createIndex('title', 'title', { unique: false })
        snippetsStore.createIndex('language', 'language', { unique: false })
        snippetsStore.createIndex('updated_at', 'updated_at', { unique: false })
        snippetsStore.createIndex('last_used_at', 'last_used_at', { unique: false })
        snippetsStore.createIndex('copy_count', 'copy_count', { unique: false })
      }

      if (!db.objectStoreNames.contains('tags')) {
        const tagsStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true })
        tagsStore.createIndex('name', 'name', { unique: true })
      }

      if (!db.objectStoreNames.contains('snippet_tags')) {
        const stStore = db.createObjectStore('snippet_tags', { keyPath: 'id' })
        stStore.createIndex('snippet_id', 'snippet_id', { unique: false })
        stStore.createIndex('tag_id', 'tag_id', { unique: false })
      }
    }
  })
}

let _db = null
async function getDb() {
  if (!_db) _db = await openDb()
  return _db
}

// ── Helpers ──
function tx(storeNames, mode = 'readonly') {
  return getDb().then(db => db.transaction(storeNames, mode))
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function fillTags(snippets) {
  for (const s of snippets) {
    s.tags = await getTags(s.id)
  }
  return snippets
}

async function getTags(snippetId) {
  const t = await tx(['snippet_tags', 'tags'])
  const stStore = t.objectStore('snippet_tags')
  const tagStore = t.objectStore('tags')
  const idx = stStore.index('snippet_id')
  const links = await promisify(idx.getAll(snippetId))
  const tags = []
  for (const link of links) {
    const tag = await promisify(tagStore.get(link.tag_id))
    if (tag) tags.push(tag)
  }
  return tags
}

async function setTags(snippetId, tagIds) {
  const t = await tx(['snippet_tags'], 'readwrite')
  const stStore = t.objectStore('snippet_tags')
  const idx = stStore.index('snippet_id')
  const links = await promisify(idx.getAll(snippetId))
  for (const link of links) {
    await promisify(stStore.delete(link.id))
  }
  for (const tagId of tagIds) {
    await promisify(stStore.add({ id: `${snippetId}-${tagId}`, snippet_id: snippetId, tag_id: tagId }))
  }
}

// ── Snippets ──
async function getAll() {
  const t = await tx('snippets')
  const all = await promisify(t.objectStore('snippets').getAll())
  all.sort((a, b) => b.updated_at - a.updated_at)
  return fillTags(all)
}

async function getRecent(limit = 10) {
  const t = await tx('snippets')
  const all = await promisify(t.objectStore('snippets').getAll())
  const filtered = all
    .filter(s => s.last_used_at > 0)
    .sort((a, b) => b.last_used_at - a.last_used_at)
    .slice(0, limit)
  return fillTags(filtered)
}

async function getFrequent(limit = 10) {
  const t = await tx('snippets')
  const all = await promisify(t.objectStore('snippets').getAll())
  const filtered = all
    .filter(s => s.copy_count > 0)
    .sort((a, b) => b.copy_count - a.copy_count || b.updated_at - a.updated_at)
    .slice(0, limit)
  return fillTags(filtered)
}

async function getByTag(tagId) {
  const t = await tx(['snippet_tags', 'snippets'])
  const idx = t.objectStore('snippet_tags').index('tag_id')
  const links = await promisify(idx.getAll(tagId))
  const snippetStore = t.objectStore('snippets')
  const snippets = []
  for (const link of links) {
    const s = await promisify(snippetStore.get(link.snippet_id))
    if (s) snippets.push(s)
  }
  snippets.sort((a, b) => b.updated_at - a.updated_at)
  return fillTags(snippets)
}

async function getById(id) {
  const t = await tx('snippets')
  const s = await promisify(t.objectStore('snippets').get(id))
  if (s) s.tags = await getTags(id)
  return s
}

async function search(query) {
  const term = query.toLowerCase()
  const t = await tx(['snippets', 'tags', 'snippet_tags'])
  const all = await promisify(t.objectStore('snippets').getAll())

  // Collect tag names for each snippet
  const tagMap = new Map()
  const stLinks = await promisify(t.objectStore('snippet_tags').getAll())
  for (const link of stLinks) {
    if (!tagMap.has(link.snippet_id)) tagMap.set(link.snippet_id, [])
    const tag = await promisify(t.objectStore('tags').get(link.tag_id))
    if (tag) tagMap.get(link.snippet_id).push(tag.name.toLowerCase())
  }

  const matched = all.filter(s => {
    const tagNames = tagMap.get(s.id) || []
    return s.title.toLowerCase().includes(term) ||
           s.content.toLowerCase().includes(term) ||
           s.language.toLowerCase().includes(term) ||
           tagNames.some(tn => tn.includes(term))
  })
  matched.sort((a, b) => b.updated_at - a.updated_at)
  return fillTags(matched)
}

async function create({ title, content, language, description = '' }) {
  const now = Date.now()
  const data = {
    title, content, language, description,
    created_at: now,
    updated_at: now,
    copy_count: 0,
    last_used_at: 0
  }
  const t = await tx('snippets', 'readwrite')
  const id = await promisify(t.objectStore('snippets').add(data))
  return getById(id)
}

async function update(id, { title, content, language, description }) {
  const t = await tx('snippets', 'readwrite')
  const store = t.objectStore('snippets')
  const existing = await promisify(store.get(id))
  if (!existing) return null
  const updated = {
    ...existing,
    title, content, language, description,
    updated_at: Date.now()
  }
  await promisify(store.put(updated))
  return getById(id)
}

async function remove(id) {
  const t = await tx(['snippets', 'snippet_tags'], 'readwrite')
  await promisify(t.objectStore('snippets').delete(id))
  const idx = t.objectStore('snippet_tags').index('snippet_id')
  const links = await promisify(idx.getAll(id))
  for (const link of links) {
    await promisify(t.objectStore('snippet_tags').delete(link.id))
  }
  return true
}

async function incrementCopyCount(id) {
  const t = await tx('snippets', 'readwrite')
  const store = t.objectStore('snippets')
  const s = await promisify(store.get(id))
  if (!s) return
  s.copy_count = (s.copy_count || 0) + 1
  s.last_used_at = Date.now()
  await promisify(store.put(s))
}

// ── Tags ──
async function getAllTags() {
  const t = await tx('tags')
  const all = await promisify(t.objectStore('tags').getAll())
  all.sort((a, b) => a.name.localeCompare(b.name))
  return all
}

async function getTagById(id) {
  const t = await tx('tags')
  return promisify(t.objectStore('tags').get(id))
}

async function createTag({ name, color = '#4a9eff' }) {
  const t = await tx('tags', 'readwrite')
  const store = t.objectStore('tags')
  try {
    const id = await promisify(store.add({ name, color, created_at: Date.now() }))
    return getTagById(id)
  } catch (e) {
    if (e.name === 'ConstraintError') return null
    throw e
  }
}

async function updateTag(id, { name, color }) {
  const t = await tx('tags', 'readwrite')
  const store = t.objectStore('tags')
  const existing = await promisify(store.get(id))
  if (!existing) return null
  const updated = { ...existing, name, color }
  await promisify(store.put(updated))
  return getTagById(id)
}

async function removeTag(id) {
  const t = await tx(['tags', 'snippet_tags'], 'readwrite')
  await promisify(t.objectStore('tags').delete(id))
  const idx = t.objectStore('snippet_tags').index('tag_id')
  const links = await promisify(idx.getAll(id))
  for (const link of links) {
    await promisify(t.objectStore('snippet_tags').delete(link.id))
  }
  return true
}

async function getTagSnippets(tagId) {
  return getByTag(tagId)
}

export {
  getAll, getRecent, getFrequent, getByTag, getById, search,
  create, update, remove, incrementCopyCount,
  getTags, setTags,
  getAllTags, getTagById, createTag, updateTag, removeTag, getTagSnippets
}
