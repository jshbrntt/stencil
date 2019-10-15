const { spawnSync } = require('child_process')
const gulp = require('gulp')

gulp.task('build:npm', ['version:annotate'], () => {
  spawnSync('yarn', ['pack'])
})
