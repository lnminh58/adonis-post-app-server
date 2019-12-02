'use strict';

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class Post extends Model {
  static get Serializer () {
    return 'App/Models/Serializers/CamelCase'
  }

  static get hidden () {
    return ['pivot']
  }

  user() {
    return this.belongsTo('App/Models/User');
  }

  category() {
    return this.belongsTo('App/Models/Category');
  }

  media() {
    return this.hasMany('App/Models/Media')
  }

  hashtags() {
    return this.belongsToMany('App/Models/Hashtag')
      .pivotTable('hashtag_posts')
  }

  likeds() {
    return this.belongsToMany('App/Models/User')
      .pivotTable('likes')
  }
}

module.exports = Post;
