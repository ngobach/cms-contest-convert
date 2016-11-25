const
    gulp = require('gulp'),
    gulpUtil = require('gulp-util'),
    del = require('del'),
    merge = require('merge-stream'),
    make = require('./make-contest'),
    zip = require('gulp-zip');

gulp.task('clean', () => {
    gulpUtil.log('Cleaning ...');
    return del('./dist/**/*');
});

gulp.task('build', () => {
    const test = gulp
        .src('./src/*')
        .pipe(make('EPU-CB-18'))
        .pipe(zip('contest.zip'))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('default', ['clean', 'build']);