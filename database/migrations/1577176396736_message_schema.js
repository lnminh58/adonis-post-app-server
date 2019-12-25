"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class MessageSchema extends Schema {
  up() {
    this.create("messages", table => {
      table.increments();
      table.string("content", 500);
      table
        .integer("user_id")
        .unsigned()
        .references("id")
        .inTable("users");
      table
        .integer("conversation_id")
        .unsigned()
        .references("id")
        .inTable("conversations");
      table.timestamps();
    });
  }

  down() {
    this.drop("messages");
  }
}

module.exports = MessageSchema;
