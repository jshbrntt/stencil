const { spawnSync } = require('child_process')
const gulp = require('gulp')

gulp.task('build:docs', ['version:annotate'], () => {
  spawnSync('./node_modules/.bin/jsdoc', [
    '--configure',
    '.jsdoc.json',
    '--verbose'
  ])
})
