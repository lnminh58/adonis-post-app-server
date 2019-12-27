"use strict";

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use("Schema");

class UserConversationSchema extends Schema {
  up() {
    this.create("user_conversations", table => {
      table.increments();
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
    });
  }

  down() {
    this.drop("user_conversations");
  }
}

module.exports = UserConversationSchema;
