/*eslint-env node*/
"use strict";

var _ = require('lodash');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

var external = ['react', 'baconjs', 'lodash', 'ramda'];

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

gulp.task('lint', function () {
  return gulp.src(['src/js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('jsbundle', ['lint'], function () {
  _.each(['client.js', 'server.js'], function (src) {
    var bundler = browserify('./src/js/' + src, {debug: true});

    bundler
      .external(external)
      .bundle()
      .pipe(source(src))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('./dist/js/'));
  });
});

gulp.task('default', ['jsbundle'], function () {
});
