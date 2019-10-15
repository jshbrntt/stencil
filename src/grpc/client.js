const debug = require('../debug')('grpc:client')
const grpc = require('grpc')

/**
 * Class representing a client for communicating to a server over GRPC.
 * @memberof grpc
 */
class GrpcClient {
  /**
   * Creates an instance of GrpcClient.
   * @param {any} uri - The GRPC API URI, you want the client to use when connecting to the server.
   * @param {any} credentials  - The GRPC credentials, you want to the client to use when connecting to the server.
   */
  constructor (uri, credentials) {
    this._uri = uri
    this._credentials = credentials
    if (typeof credentials === 'undefined') {
      this._credentials = grpc.credentials.createInsecure()
    }
    // this._client = new HelloWorldClient(this._uri, this._credentials)
    debug('Instantiated')
  }

  /**
   * Send a message to the server using GRPC.
   * @param {any} name - The name you want sent in the message to the server.
   * @return {Promise} A promise that resolves with the response from the server.
   */
  send (name) {
    debug('send', name)
    // let client = this._client
    return new Promise((resolve, reject) => {
      // const request = new HelloRequest()
      // request.setName(name)
      // client.sayHello(request, (err, response) => {
      //   if (err) return reject(err)
      //   resolve(response.getGreeting())
      // })
    })
  }
}

module.exports = GrpcClient
