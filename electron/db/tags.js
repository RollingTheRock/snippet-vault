const db = require('./index')

const getAll = () => {
  return db.prepare('SELECT * FROM tags ORDER BY name').all()
}

const getById = (id) => {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id)
}

const create = ({ name, color = '#4a9eff' }) => {
  try {
    const result = db.prepare('INSERT INTO tags (name, color) VALUES (?, ?)').run(name, color)
    return getById(result.lastInsertRowid)
  } catch (e) {
    if (e.message.includes('UNIQUE constraint failed')) return null
    throw e
  }
}

const update = (id, { name, color }) => {
  db.prepare('UPDATE tags SET name = ?, color = ? WHERE id = ?').run(name, color, id)
  return getById(id)
}

const remove = (id) => {
  db.prepare('DELETE FROM tags WHERE id = ?').run(id)
  return true
}

const getSnippets = (tagId) => {
  return db.prepare(`
    SELECT s.* FROM snippets s
    JOIN snippet_tags st ON s.id = st.snippet_id
    WHERE st.tag_id = ?
  `).all(tagId)
}

module.exports = { getAll, getById, create, update, remove, getSnippets }
