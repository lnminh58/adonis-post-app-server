"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Conversation extends Model {
  static get Serializer () {
    return 'App/Models/Serializers/CamelCase'
  }

  users() {
    return this.belongsToMany("App/Models/User").pivotTable("user_conversations");
  }

  messages() {
    return this.hasMany('App/Models/Message')
  }
}

module.exports = Conversation;
