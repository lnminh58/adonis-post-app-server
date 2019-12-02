'use strict';

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema');

class ProfileSchema extends Schema {
  up() {
    this.create('profiles', (table) => {
      table.increments();
      table
        .bigInteger('identify_card_number')
        .unique();
      table.string('avatar_url', 1000);
      table.string('phone', 50);
      table.enu('gender', ['MALE', 'FEMALE']);
      table.string('address', 200);
      table.string('city', 50).nullable();
      table.string('country', 50).nullable();
      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users');
      table.timestamps();
    });
  }

  down() {
    this.drop('profiles');
  }
}

module.exports = ProfileSchema;
