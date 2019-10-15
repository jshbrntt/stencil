const before = require('mocha').before
const debug = require('../debug')('unit')
const describe = require('mocha').describe
const faker = require('faker')
const it = require('mocha').it
require('chai').should()

const World = require('./world')

describe('World', () => {
  let world
  let name
  before(() => {
    // Generate a fake name to use in the test.
    name = faker.name.findName()
    debug(`Generated fake name '${name}'`)
  })
  it('can be instantiated', () => {
    world = new World(name)
  })
  describe('greet', () => {
    let greeting
    it('returns a greeting', () => {
      greeting = world.greet()
    })
    it('greeting is a string', () => {
      greeting.should.be.a('string')
    })
    it('greeting contains "Hello"', () => {
      greeting.should.contain('Hello')
    })
    it('greeting contains name supplied', () => {
      greeting.should.contain(name)
    })
  })
})
