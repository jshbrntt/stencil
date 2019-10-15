const debug = require('../debug')('script')

const { World } = require('../hello')

/**
 * Class representing a script to be run.
 * @memberof script
 */
class Script {
  /**
   * Run the script and log out a greeting message.
   * @return {string} A greeting message generated using World.
   */
  static run (name) {
    const world = new World(name)
    const greeting = world.greet()
    debug(greeting)
    return greeting
  }
}

module.exports = Script
