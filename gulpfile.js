'use strict';

const gulp   = require('gulp'),
      zopfli = require('gulp-zopfli');

const paths = {
  html: [
    'html/index.html'
  ],
  css: [
    'css/**/*'
  ],
  js: [
    'js/**/*'
  ]
};

const tasks = Object.keys(paths);

gulp.task('html', function() {
  let htmlmin = require('gulp-htmlmin');
  let htmlminOpts = {
    removeComments: true,
    collapseWhitespace: true,
    collapseBooleanAttributes: true,
    removeAttributeQuotes: true,
    removeRedundantAttributes: true,
    preventAttributesEscaping: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    removeOptionalTags: true,
    removeIgnored: true
  };

  return gulp.src(paths.html)
    .pipe(htmlmin(htmlminOpts))
    .pipe(gulp.dest('static'))
    .pipe(zopfli())
    .pipe(gulp.dest('static'));
});

gulp.task('css', function() {
  let sass   = require('gulp-sass'),
      cssmin = require('gulp-minify-css');

  return gulp.src('css/app.sass')
    .pipe(sass({
      indentedSyntax: true,
      errLogToConsole: true
    }))
    .pipe(cssmin())
    .pipe(gulp.dest('static'))
    .pipe(zopfli())
    .pipe(gulp.dest('static'));
});

gulp.task('js', function() {
  let babel = require('gulp-babel');

  return gulp.src('js/app.js')
    .pipe(babel())
    .pipe(gulp.dest('static'))
    .pipe(zopfli())
    .pipe(gulp.dest('static'));
});

gulp.task('watch', function() {
  tasks.forEach(function(task) {
    gulp.watch(paths[task], [task]);
  });
});

gulp.task('default', tasks);
