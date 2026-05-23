const { registerSnippetHandlers } = require('./snippets')
const { registerTagHandlers } = require('./tags')

function registerAllIpcHandlers() {
  registerSnippetHandlers()
  registerTagHandlers()
}

module.exports = { registerAllIpcHandlers }
