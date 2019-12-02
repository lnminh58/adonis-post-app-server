'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Category extends Model {
  static get Serializer () {
    return 'App/Models/Serializers/CamelCase'
  }

  posts () {
    return this.hasMany('App/Models/Post')
  }
}

module.exports = Category
