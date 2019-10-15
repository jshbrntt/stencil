const { after, before, describe, it } = require('mocha')
const debug = require('../src/debug')('func:http')
const Docker = require('dockerode')
const faker = require('faker')
const glob = require('glob')
const path = require('path')

require('chai').should()

// Instantiate Docker client.
const docker = new Docker()

// Generate a fake name to send in requests.
const name = faker.name.firstName()

describe('HTTP Client, Server Communication', () => {
  let containers = {}
  let imageFile
  let imageName
  let httpClientContainerName = `http.client_${Date.now()}`
  let httpClientLogs = ''
  let httpClientStream
  let httpServerContainerName = `http.server_${Date.now()}`
  let httpServerLogs = ''
  let httpServerStream
  let imagePattern = /^Loaded image:\s(.+)\s$/

  before('find the docker image tar file', () => {
    return new Promise((resolve, reject) => {
      glob(path.join('.', '*.tar'), (err, files) => {
        if (err) return reject(err)
        debug(files)
        files.length.should.be.greaterThan(0)
        imageFile = files[0]
        imageName = path.basename(files[0], '.tar')
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

  it('created http.server container', () => {
    return docker.createContainer({
      Image: imageName,
      Cmd: [
        'http.server'
      ],
      name: httpServerContainerName
    })
      .then(container => {
        debug(container)
        containers['http.server'] = container
        return container
      })
  })

  it('created http.client container', () => {
    return docker.createContainer({
      Image: imageName,
      Cmd: [
        'http.client',
        name
      ],
      name: httpClientContainerName,
      Env: [
        'HTTP_CLIENT_API_URI=http://http.server:5000'
      ],
      HostConfig: {
        Links: [
          `${httpServerContainerName}:http.server`
        ]
      }
    })
      .then(container => {
        debug(container)
        containers['http.client'] = container
        return container
      })
  })

  it('attached to http.server container', () => {
    return containers['http.server'].attach({
      stream: true,
      stdout: true,
      stderr: true
    })
      .then(stream => {
        debug(stream)
        httpServerStream = stream
        return stream
      })
  })

  it('attached to http.client container', () => {
    return containers['http.client'].attach({
      stream: true,
      stdout: true,
      stderr: true
    })
      .then(stream => {
        debug(stream)
        httpClientStream = stream
        return stream
      })
  })

  it('client and server communicate successfully', () => {
    // Listening for data on the streams (logs).
    let httpClientSentRequest = new Promise((resolve, reject) => {
      httpClientStream.on('data', chunk => {
        debug(chunk.toString())
        httpClientLogs += chunk
      })
      httpClientStream.on('end', () => {
        debug('http.client stream ended')
        httpClientLogs.toString().should.contain(name)
        resolve()
      })
    })

    let httpServerReceivedRequest = new Promise((resolve, reject) => {
      let gate = false
      httpServerStream.on('data', chunk => {
        debug(chunk.toString())
        httpServerLogs += chunk
        if (!gate && httpServerLogs.toString().includes(name)) {
          gate = true
          resolve()
        }
      })
      httpServerStream.on('end', () => {
        debug('http.server stream ended')
        reject(new Error('Stream for http.server was not supposed to have ended yet.'))
      })
    })

    // Start the server.
    return containers['http.server'].start()
      .then(data => {
        debug(data)
        return data
      })
      .then(containers['http.client'].start())
      .then(data => {
        debug(data)
        return data
      })
      .then(() => Promise.all([
        httpClientSentRequest,
        httpServerReceivedRequest
      ]))
  })

  it(`http.server container logs contain '${name}'`, () => {
    httpServerLogs.toString().should.contain(name)
  })

  it(`http.client container logs contain '${name}'`, () => {
    httpClientLogs.toString().should.contain(name)
  })

  after('can remove containers created during the test', () => {
    return Promise.all(Object.values(containers).map(container => {
      return container.remove({ force: true })
        .then(data => {
          debug(data)
        })
    }))
  })
})
