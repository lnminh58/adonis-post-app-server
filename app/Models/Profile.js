'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Profile extends Model {
  static get Serializer () {
    return 'App/Models/Serializers/CamelCase'
  }

  user() {
    return this.belongsTo('App/Models/User');
  }
}

module.exports = Profile;
