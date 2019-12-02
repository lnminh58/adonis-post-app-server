'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Media extends Model {
  static get Serializer () {
    return 'App/Models/Serializers/CamelCase'
  }

  post() {
    return this.belongsTo('App/Models/Post');
  }
}

module.exports = Media
