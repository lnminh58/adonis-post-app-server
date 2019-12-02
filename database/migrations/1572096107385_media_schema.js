'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class MediaSchema extends Schema {
  up() {
    this.create('media', (table) => {
      table.increments();
      table.string('source', 1000).notNullable();
      table.string('ext', 100);
      table.enu('type', ['VIDEO', 'IMAGE']);
      table
        .integer('post_id')
        .unsigned()
        .references('id')
        .inTable('posts');
      table.timestamps();
    });
  }

  down() {
    this.drop('media');
  }
}

module.exports = MediaSchema;
