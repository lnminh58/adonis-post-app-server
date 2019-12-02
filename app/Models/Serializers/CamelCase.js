'use strict'

const _ = require('lodash')
const VanillaSerializer = require('@adonisjs/lucid/src/Lucid/Serializers/Vanilla')

class CamelCaseSerializer extends VanillaSerializer {
  _camelizeProperties (collection) {
    return _.reduce(collection, (result, value, key) => {
      result[_.camelCase(key)] = value
      return result
    }, {})
  }

  _attachMeta (modelInstance, output) {
    if (_.size(modelInstance.$sideLoaded)) {
      output.__meta__ = this._camelizeProperties(modelInstance.$sideLoaded)
    }
  }

  _getRowJSON (modelInstance) {
    const json = this._camelizeProperties(modelInstance.toObject())
    this._attachRelations(modelInstance, json)
    this._attachMeta(modelInstance, json)

    delete json.pivot

    return json
  }
}

module.exports = CamelCaseSerializer
