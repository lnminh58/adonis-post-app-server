'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 254).notNullable().unique()
      table.string('username', 80).notNullable()
      table.string('password', 60)
      table.string('activation_token', 50)
      table.boolean('is_activated').defaultTo(false)
      table.boolean('status').defaultTo(true)
      table.enu('login_source', ['EMAIL', 'FACEBOOK', 'GOOGLE'])
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
