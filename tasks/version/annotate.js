const { spawnSync } = require('child_process')
const gulp = require('gulp')
const path = require('path')
const process = require('process')

gulp.task('version:annotate', () => {
  let { version } = require(path.join(global.__base, 'package.json'))
  version = version.replace(/-.*$/, '')
  let preReleaseVersion
  if (process.env['GITLAB_CI']) {
    if (!process.env['CI_COMMIT_TAG']) {
      preReleaseVersion = `${process.env['CI_COMMIT_REF_SLUG']}.${
        process.env['CI_PIPELINE_ID']
      }`
    }
  } else {
    preReleaseVersion = `local.${Date.now()}`
  }
  if (preReleaseVersion) {
    version = `${version}-${preReleaseVersion}`
  }
  if (process.env['BUILD_METADATA']) {
    version = `${version}+${process.env['BUILD_METADATA']}`
  }
  spawnSync('yarn', [
    'version',
    '--no-git-tag-version',
    '--new-version',
    version
  ])
})
