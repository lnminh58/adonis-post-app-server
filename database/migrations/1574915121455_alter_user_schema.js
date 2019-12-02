'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class AlterUserSchema extends Schema {
  up () {
    this.table('users', (table) => {
      // alter table
      // table.string('activation_token').nullable().alter()
    })
  }

  down () {
    this.table('alter_users', (table) => {
      // reverse alternations
    })
  }
}

module.exports = AlterUserSchema
