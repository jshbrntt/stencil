#!/usr/bin/env node

const process = require('process')

// Enable colors by default.
process.env['DEBUG_COLORS'] = process.env['DEBUG_COLORS'] || true

const debug = require('./debug')('main')
const os = require('os')

const { Script } = require('./script')
const { HttpClient, HttpServer } = require('./http')
const { GrpcClient, GrpcServer } = require('./grpc')

const main = () => {
  const args = process.argv.slice(2)
  debug('args', args)
  if (args.length) {
    let server
    let client
    switch (args[0]) {
      default:
        Script.run(args[0] || os.userInfo().username)
        break
      case 'http.server':
        server = new HttpServer()
        server.start(
          process.env['HTTP_SERVER_PORT'] || 5000,
          process.env['HTTP_SERVER_HOSTNAME'] || '0.0.0.0'
        )
        break
      case 'http.client':
        client = new HttpClient(
          process.env['HTTP_CLIENT_API_URI'] || 'http://0.0.0.0:5000'
        )
        client
          .send(args[1] || os.userInfo().username)
          .then(body => {
            debug(body)
          })
          .catch(err => {
            debug(err)
            throw err
          })
        break
      case 'grpc.server':
        server = new GrpcServer()
        server.start(
          process.env['GRPC_SERVER_PORT'] || 50051,
          process.env['GRPC_SERVER_HOSTNAME'] || '0.0.0.0'
        )
        break
      case 'grpc.client':
        client = new GrpcClient(
          process.env['GRPC_CLIENT_API_URI'] || '0.0.0.0:50051'
        )
        client
          .send(args[1] || os.userInfo().username)
          .then(body => {
            debug(body)
          })
          .catch(err => {
            debug(err)
            throw err
          })
        break
    }
  } else {
    debug('No arguments provided exiting...')
    process.exit(0)
  }
}

main()
