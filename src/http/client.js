const request = require('request-promise-native')
const debug = require('../debug')('http:client')

const DEFAULT_OPTIONS = {
  json: true
}

/**
 * Class representing a client for communicating to a server over HTTP.
 * @memberof http
 */
class HttpClient {
  /**
   * Creates an instance of HttpClient.
   * @param {any} uri - The HTTP API URI, you want the client to use when connecting to the server.
   * @param {any} options - The base options you when the client to use when creating requests to be sent to the server.
   */
  constructor (uri, options) {
    this._uri = uri
    this._options = Object.assign({}, DEFAULT_OPTIONS, options)
    debug('Instantiated')
  }
  /**
   * Send a message to the server using HTTP.
   * @param {any} name - The name you want sent in the message to the server.
   * @param {string} [method='GET'] - The HTTP method you want to be used in the request made to the server.
   * @return {Promise} A promise that resolves with the response from the server.
   */
  send (name, method = 'GET') {
    debug('send', name, method)
    let options = Object.assign({}, this._options, {
      uri: `${this._uri}/hello`,
      method
    })
    let body = {}
    if (name) {
      body = { name }
    }
    switch (method) {
      case 'GET':
        options.qs = body
        break
      default:
        options.body = body
    }
    return request(options).then(body => {
      debug(body)
      return body
    })
  }
}

HttpClient.DEFAULT_OPTIONS = DEFAULT_OPTIONS

module.exports = HttpClient
