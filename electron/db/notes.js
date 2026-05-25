const db = require('./index')

const getAll = () => {
  const notes = db.prepare('SELECT * FROM notes ORDER BY updated_at DESC').all()
  for (const note of notes) {
    note.tags = getTags(note.id)
  }
  return notes
}

const getById = (id) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id)
  if (note) note.tags = getTags(id)
  return note
}

const search = (query) => {
  const term = `%${query}%`
  const notes = db.prepare(`
    SELECT DISTINCT n.* FROM notes n
    LEFT JOIN note_tags nt ON n.id = nt.note_id
    LEFT JOIN tags t ON nt.tag_id = t.id
    WHERE n.title LIKE ? OR n.content LIKE ? OR t.name LIKE ?
    ORDER BY n.updated_at DESC
  `).all(term, term, term)
  for (const note of notes) {
    note.tags = getTags(note.id)
  }
  return notes
}

const create = ({ title, content = '' }) => {
  const result = db.prepare(`
    INSERT INTO notes (title, content)
    VALUES (?, ?)
  `).run(title, content)
  return getById(result.lastInsertRowid)
}

const update = (id, { title, content }) => {
  db.prepare(`
    UPDATE notes
    SET title = ?, content = ?, updated_at = (strftime('%s', 'now') * 1000)
    WHERE id = ?
  `).run(title, content, id)
  return getById(id)
}

const remove = (id) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  return true
}

const getTags = (noteId) => {
  return db.prepare(`
    SELECT t.* FROM tags t
    JOIN note_tags nt ON t.id = nt.tag_id
    WHERE nt.note_id = ?
  `).all(noteId)
}

const setTags = (noteId, tagIds) => {
  db.prepare('DELETE FROM note_tags WHERE note_id = ?').run(noteId)
  const insert = db.prepare('INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)')
  for (const tagId of tagIds) {
    insert.run(noteId, tagId)
  }
}

const getByTag = (tagId) => {
  const notes = db.prepare(`
    SELECT n.* FROM notes n
    JOIN note_tags nt ON n.id = nt.note_id
    WHERE nt.tag_id = ?
    ORDER BY n.updated_at DESC
  `).all(tagId)
  for (const note of notes) {
    note.tags = getTags(note.id)
  }
  return notes
}

module.exports = {
  getAll, getById, search, create, update, remove,
  getTags, setTags, getByTag
}
