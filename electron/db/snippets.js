const db = require('./index')

const getAll = () => {
  return db.prepare('SELECT * FROM snippets ORDER BY updated_at DESC').all()
}

const getById = (id) => {
  return db.prepare('SELECT * FROM snippets WHERE id = ?').get(id)
}

const search = (query) => {
  const term = `%${query}%`
  return db.prepare(`
    SELECT DISTINCT s.* FROM snippets s
    LEFT JOIN snippet_tags st ON s.id = st.snippet_id
    LEFT JOIN tags t ON st.tag_id = t.id
    WHERE s.title LIKE ? OR s.content LIKE ? OR s.language LIKE ? OR t.name LIKE ?
    ORDER BY s.updated_at DESC
  `).all(term, term, term, term)
}

const create = ({ title, content, language, description = '' }) => {
  const result = db.prepare(`
    INSERT INTO snippets (title, content, language, description)
    VALUES (?, ?, ?, ?)
  `).run(title, content, language, description)
  return getById(result.lastInsertRowid)
}

const update = (id, { title, content, language, description }) => {
  db.prepare(`
    UPDATE snippets
    SET title = ?, content = ?, language = ?, description = ?, updated_at = (strftime('%s', 'now') * 1000)
    WHERE id = ?
  `).run(title, content, language, description, id)
  return getById(id)
}

const remove = (id) => {
  db.prepare('DELETE FROM snippets WHERE id = ?').run(id)
  return true
}

const incrementCopyCount = (id) => {
  db.prepare('UPDATE snippets SET copy_count = copy_count + 1 WHERE id = ?').run(id)
}

const getTags = (snippetId) => {
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN snippet_tags st ON t.id = st.tag_id
    WHERE st.snippet_id = ?
  `).all(snippetId)
}

const setTags = (snippetId, tagIds) => {
  db.prepare('DELETE FROM snippet_tags WHERE snippet_id = ?').run(snippetId)
  const insert = db.prepare('INSERT INTO snippet_tags (snippet_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) {
    insert.run(snippetId, tagId)
  }
}

module.exports = { getAll, getById, search, create, update, remove, incrementCopyCount, getTags, setTags }
