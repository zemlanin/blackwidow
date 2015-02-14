"use strict";

var _ = require('lodash');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');

var external = ['react/addons', 'baconjs', 'firebase', 'lodash'];

gulp.task('lint', function () {
  return gulp.src(['src/js/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('jscore', function () {
  var bundler = browserify();

  return bundler
    .require(external)
    .bundle()
    .pipe(source('core.js'))
    .pipe(gulp.dest('./public/js/'));
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
      .pipe(gulp.dest('./public/js/'));
  });
});

gulp.task('default', ['jsbundle'], function () {
});

gulp.task('watch', function () {
  gulp.watch(['src/js/**/*.js'], ['jsbundle']);
  gulp.watch(['package.json'], ['jscore']);
});

gulp.task('js', ['jscore', 'jsbundle'], function () {
});
