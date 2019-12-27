'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Message extends Model {
  static get Serializer () {
    return 'App/Models/Serializers/CamelCase'
  }

  conversation() {
    return this.belongsTo('App/Models/Conversation');
  }

  user() {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Message
