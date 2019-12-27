'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class ConversationSchema extends Schema {
  up () {
    this.create('conversations', (table) => {
      table.increments()
      table.string('name', 200)
      table.string('topic', 50)
      table.boolean('is_private')
      table.timestamps()
    })
  }

  down () {
    this.drop('conversations')
  }
}

module.exports = ConversationSchema
