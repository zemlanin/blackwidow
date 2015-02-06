"use strict";

var _ = require('lodash');
var gulp = require('gulp');
var eslint = require('gulp-eslint');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

var external = ['react/addons', 'baconjs', 'firebase', 'lodash', 'qrcode.react'];

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
    var bundler = browserify(['./src/js/' + src]);

    bundler
      .external(external)
      .bundle()
      .pipe(source(src))
      .pipe(gulp.dest('./public/js/'));
  });
});

gulp.task('default', ['jsbundle'], function () {
});

gulp.task('watch', function () {
  gulp.watch(['src/js/**/*.js'], ['jsbundle']);
  gulp.watch(['node_modules/', 'package.json'], ['jscore']);
});

gulp.task('js', ['jscore', 'jsbundle'], function () {
});
