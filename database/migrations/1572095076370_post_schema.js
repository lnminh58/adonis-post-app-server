'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class PostSchema extends Schema {
  up() {
    this.create('posts', (table) => {
      table.increments();
      table.string('title', 100).notNullable();
      table.string('description', 3000).notNullable();
      table.string('link', 1000).notNullable();
      table.integer('view').defaultTo(0);
      table.boolean('is_active').defaultTo(true);
      table
        .integer('category_id')
        .unsigned()
        .references('id')
        .inTable('categories');
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.timestamps(true);
    });
  }

  down() {
    this.drop('posts');
  }
}

module.exports = PostSchema;
