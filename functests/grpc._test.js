const { after, before, describe, it } = require('mocha')
const { should } = require('chai')
const debug = require('../src/debug')('func:grpc')
const Docker = require('dockerode')
const faker = require('faker')
const glob = require('glob')
const path = require('path')

should()

// Instantiate Docker client.
const docker = new Docker()

// Generate a fake name to send in requests.
const name = faker.name.firstName()

describe('GRPC Client, Server Communication', () => {
  let containers = {}
  let imageFile
  let imageName
  let grpcClientContainerName = `grpc.client_${Date.now()}`
  let grpcClientLogs = ''
  let grpcClientStream
  let grpcServerContainerName = `grpc.server_${Date.now()}`
  let grpcServerLogs = ''
  let grpcServerStream
  let imagePattern = /^Loaded image:\s(.+)\s$/

  before('find the docker image tar file', () => {
    return new Promise((resolve, reject) => {
      glob(path.join('.', '*.tar'), (err, files) => {
        if (err) return reject(err)
        debug(files)
        files.length.should.be.greaterThan(0)
        imageFile = files[0]
        return resolve(files)
      })
    })
  })

  it('loaded docker image onto host', () => {
    return docker.loadImage(imageFile).then(stream => {
      return new Promise((resolve, reject) => {
        let gate = false
        stream.statusCode.should.equal(200)
        stream.on('data', chunk => {
          let msg = JSON.parse(chunk.toString())
          debug(msg)
          if (!gate && 'stream' in msg) {
            gate = true
            msg.stream.should.contain('Loaded image')
            imageName = imagePattern.exec(msg.stream)[1]
            resolve()
          }
        })
      })
    })
  })

  it('created grpc.server container', () => {
    return docker
      .createContainer({
        Image: imageName,
        Cmd: ['grpc.server'],
        name: grpcServerContainerName
      })
      .then(container => {
        debug(container)
        containers['grpc.server'] = container
        return container
      })
  })

  it('created grpc.client container', () => {
    return docker
      .createContainer({
        Image: imageName,
        Cmd: ['grpc.client', name],
        name: grpcClientContainerName,
        Env: ['GRPC_CLIENT_API_URI=grpc.server:50051'],
        HostConfig: {
          Links: [`${grpcServerContainerName}:grpc.server`]
        }
      })
      .then(container => {
        debug(container)
        containers['grpc.client'] = container
        return container
      })
  })

  it('attached to grpc.server container', () => {
    return containers['grpc.server']
      .attach({
        stream: true,
        stdout: true,
        stderr: true
      })
      .then(stream => {
        debug(stream)
        grpcServerStream = stream
        return stream
      })
  })

  it('attached to grpc.client container', () => {
    return containers['grpc.client']
      .attach({
        stream: true,
        stdout: true,
        stderr: true
      })
      .then(stream => {
        debug(stream)
        grpcClientStream = stream
        return stream
      })
  })

  it('client and server communicate successfully', () => {
    // Listening for data on the streams (logs).
    let grpcClientSentRequest = new Promise((resolve, reject) => {
      grpcClientStream.on('data', chunk => {
        debug(chunk.toString())
        grpcClientLogs += chunk
      })
      grpcClientStream.on('end', () => {
        debug('grpc.client stream ended')
        grpcClientLogs.toString().should.contain(name)
        resolve()
      })
    })

    let grpcServerReceivedRequest = new Promise((resolve, reject) => {
      let gate = false
      grpcServerStream.on('data', chunk => {
        debug(chunk.toString())
        grpcServerLogs += chunk
        if (!gate && grpcServerLogs.toString().includes(name)) {
          gate = true
          resolve()
        }
      })
      grpcServerStream.on('end', () => {
        debug('grpc.server stream ended')
        reject(
          new Error(
            'Stream for grpc.server was not supposed to have ended yet.'
          )
        )
      })
    })

    // Start the server.
    return containers['grpc.server']
      .start()
      .then(data => {
        debug(data)
        return data
      })
      .then(containers['grpc.client'].start())
      .then(data => {
        debug(data)
        return data
      })
      .then(() =>
        Promise.all([grpcClientSentRequest, grpcServerReceivedRequest])
      )
  })

  it(`grpc.server container logs contain '${name}'`, () => {
    grpcServerLogs.toString().should.contain(name)
  })

  it(`grpc.client container logs contain '${name}'`, () => {
    grpcClientLogs.toString().should.contain(name)
  })

  after('can remove containers created during the test', () => {
    return Promise.all(
      Object.values(containers).map(container => {
        return container.remove({ force: true }).then(data => {
          debug(data)
        })
      })
    )
  })
})
