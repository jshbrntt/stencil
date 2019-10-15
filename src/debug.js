const pjson = require('../package.json')
const process = require('process')

process.env['DEBUG'] = process.env['DEBUG'] || `${pjson.name}:*`

const debug = require('debug')

const DebugFactory = (namespace) => {
  return debug(`${pjson.name}:${namespace}`)
}

module.exports = DebugFactory
