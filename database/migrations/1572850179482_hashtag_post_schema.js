'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class HashtagPostSchema extends Schema {
  up () {
    this.create('hashtag_posts', (table) => {
      table.increments()
      table
      .integer('post_id')
      .unsigned()
      .references('id')
      .inTable('posts');
      table
      .integer('hashtag_id')
      .unsigned()
      .references('id')
      .inTable('hashtags');
    })
  }

  down () {
    this.drop('hashtag_posts')
  }
}

module.exports = HashtagPostSchema
