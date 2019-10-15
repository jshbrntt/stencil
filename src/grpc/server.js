const debug = require('../debug')('grpc:server')
const { Server, ServerCredentials } = require('grpc')

// const { World } = require('../hello')

/**
 * Class representing a server for communicating to a client over GRPC.
 * @memberof grpc
 */
class GrpcServer {
  /**
   * Creates an instance of GrpcServer.
   * @param {grpc.ServerCredentials} [credentials=ServerCredentials.createInsecure()] - The GRPC credentials used by the server.
   */
  constructor (credentials = ServerCredentials.createInsecure()) {
    this._credentials = credentials
    this._server = new Server()
    debug('Instantiated')
  }
  _setupServices (server) {
    // server.addService(HelloWorldService, {
    //   sayHello: this._onRequest.bind(this)
    // })
    return server
  }
  /**
   * Start the server and begin listening for requests.
   * @param {number} [port=50051] - The port number you want this server to bind to.
   * @param {string} [hostname='0.0.0.0'] - The hostname you want this server to bind to.
   */
  start (port = 50051, hostname = '0.0.0.0') {
    this._server = this._setupServices(this._server)
    this._server.bind(`${hostname}:${port}`, this._credentials)
    this._server.start()
    debug(`Listening at http://${hostname}:${port}`)
  }
  _onRequest (call, callback) {
    debug('Request')
    debug(call)
    // const name = call.request.getName()
    // const world = new World(name)
    // const greeting = world.greet()
    // const response = new HelloResponse()
    // response.setGreeting(greeting)
    // debug('Response')
    // debug(response)
    // callback(null, response)
    callback(null)
  }
}

module.exports = GrpcServer
