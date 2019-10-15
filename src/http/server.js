const bodyParser = require('body-parser')
const debug = require('../debug')('http:server')
const express = require('express')

const { World } = require('../hello')

/**
 * Class representing a server for communicating to a client over HTTP.
 * @memberof http
 */
class HttpServer {
  /**
   * Creates an instance of HttpServer.
   */
  constructor () {
    this._app = express()
    debug('Instantiated')
  }
  /**
   * Start the server and begin listening for requests.
   * @param {number} [port=5000] - The port number you want this server to bind to.
   * @param {string} [hostname='0.0.0.0'] - The hostname you want this server to bind to.
   */
  start (port = 5000, hostname = '0.0.0.0') {
    this._app = this._setupMiddleware(this._app)
    this._app = this._setupRoutes(this._app)
    this._server = this._app.listen(port, hostname, () => {
      debug(
        `Listening at http://${this._server.address().address}:${
          this._server.address().port
        }`
      )
    })
  }
  _setupMiddleware (app) {
    app.use(bodyParser.json())
    return app
  }
  _setupRoutes (app) {
    app.get('/', this._onRequest.bind(this))
    app.post('/', this._onRequest.bind(this))
    return app
  }
  _getName (name) {
    return name || 'world'
  }
  _getWorld (name) {
    return new World(this._getName(name))
  }
  _getGreeting (name) {
    let world = this._getWorld(name)
    return world.greet()
  }
  _getResponseBody (req) {
    switch (req.method) {
      case 'GET':
        return {
          greeting: this._getGreeting(req.query['name'])
        }
      default:
        return {
          greeting: this._getGreeting(req.body['name'])
        }
    }
  }
  _onRequest (req, res) {
    debug('Request')
    debug(req)
    res.json(this._getResponseBody(req))
    debug('Response')
    debug(res)
    return res
  }
}

module.exports = HttpServer
