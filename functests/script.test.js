const { after, before, describe, it } = require('mocha')
const debug = require('../src/debug')('func:script')
const Docker = require('dockerode')
const faker = require('faker')
const glob = require('glob')
const path = require('path')

require('chai').should()

// Instantiate Docker client.
const docker = new Docker()

// Generate a fake name to send in requests.
const name = faker.name.firstName()

describe('Script', () => {
  let containers = {}
  let imageFile
  let imageName
  let scriptContainerName = `script_${Date.now()}`
  let scriptLogs = ''
  let scriptStream
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

  it('created script container', () => {
    return docker.createContainer({
      Image: imageName,
      Cmd: [
        name
      ],
      name: scriptContainerName
    })
      .then(container => {
        debug(container)
        containers['script'] = container
        return container
      })
  })

  it('attached to script container', () => {
    return containers['script'].attach({
      stream: true,
      stdout: true,
      stderr: true
    })
      .then(stream => {
        debug(stream)
        scriptStream = stream
        return stream
      })
  })

  it('started script container', () => {
    let promise = new Promise((resolve, reject) => {
      scriptStream.on('data', chunk => {
        debug(chunk.toString())
        scriptLogs += chunk
      })
      scriptStream.on('end', () => {
        debug('script stream ended')
        resolve()
      })
    })
    return containers['script'].start()
      .then(data => {
        debug(data)
        return data
      })
      .then(() => promise)
  })

  it(`script container logs contain '${name}'`, () => {
    scriptLogs.toString().should.contain(name)
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
