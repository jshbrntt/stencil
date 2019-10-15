const debug = require('../debug')('hello:world')

/**
 * Class representing a World.
 * @memberof hello
 */
class World {
  /**
   * Constructs a world object that stores a given name.
   * @param {string} name - The owner of this world.
   * @example
   * let world = new hello.World('John')
   * world.greet() => 'Hello John!'
   */
  constructor (name) {
    this.name = name
    debug(`Instantiated with name '${name}'`)
  }

  /**
   * Get a greeting message from the world to its owner.
   * @return {string} A message greeting the owner of the world.
   */
  greet () {
    return `Hello ${this.name}! Welcome!`
  }
}

module.exports = World
