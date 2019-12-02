'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class HashtagSchema extends Schema {
  up() {
    this.create('hashtags', (table) => {
      table.increments();
      table.string('name', 50);
      table.timestamps();
    });
  }

  down() {
    this.drop('hashtags');
  }
}

module.exports = HashtagSchema;
