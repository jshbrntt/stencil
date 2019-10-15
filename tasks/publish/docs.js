const { ncp } = require('ncp')
const debug = require('../../src/debug')('publish:docs')
const glob = require('glob')
const gulp = require('gulp')
const path = require('path')
const process = require('process')
const rimraf = require('rimraf')
const semver = require('semver')

const DOCS_PUBLIC_DIRECTORY =
  process.env['DOCS_PUBLIC_DIRECTORY'] || path.join(global.__base, 'public')
const DOCS_RELEASE_PATTERN =
  process.env['DOCS_RELEASE_PATTERN'] ||
  path.join(global.__base, 'docs', '**', '**', '+([0-9]).+([0-9]).+([0-9])/')

gulp.task('publish:docs', () => {
  // Clean the public directory.
  return (
    new Promise((resolve, reject) => {
      let target = DOCS_PUBLIC_DIRECTORY
      rimraf(target, err => {
        if (err) return reject(err)
        debug(`Removed: ${target}`)
        return resolve()
      })
    })
      // Find docs that related to releases (not pre-releases), sort by version.
      .then(
        () =>
          new Promise((resolve, reject) => {
            glob(DOCS_RELEASE_PATTERN, (err, files) => {
              if (err || !files.length) return reject(err)
              files.sort((a, b) =>
                semver.rcompare(path.basename(a), path.basename(b))
              )
              return resolve(files)
            })
          })
      )
      // Copy the docs to the public directory.
      .then(files => {
        return new Promise((resolve, reject) => {
          let [target] = files
          let dest = DOCS_PUBLIC_DIRECTORY
          // Copy the latest docs to the root of the public directory.
          ncp(target, dest, err => {
            if (err) return reject(err)
            debug(`Moved: ${target} => ${dest}`)
            resolve(files)
          })
        })
      })
  )
})
