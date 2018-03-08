'use strict';

let Gulp = require('gulp');
let Nodemon = require('gulp-nodemon');
let Env = require('gulp-env');
let Sass = require('gulp-sass');
let PostCSS = require('gulp-postcss');
let Clean = require('gulp-clean');

let Cssnext = require('postcss-cssnext');
let Cssnano = require('cssnano');

let FS = require('fs');

let Config = require('./config');

Gulp.task('dashcss', () => {
    return Gulp.src('./src/scss/dash.scss')
        .pipe(Sass({
            prefix: '/css',
            includePaths: Config.frontend.sassIncludePaths
        }))
        .pipe(PostCSS([
            Cssnext({
                browsers: Config.frontend.browserSupport
            }),
            Cssnano({
                autoprefixer: false
            })
        ]))
        .pipe(Gulp.dest('./assets/css/'));
});

Gulp.task('watchscss', () => Gulp.watch('./src/scss/*.scss', Gulp.series('dashcss')));

Gulp.task('rundbg', () => {
    Env({
        vars: {
            NODE_ENV: 'debug'
        }
    });
    Nodemon({
        ext: 'js es6 json',
        watch: '.',
        exec: 'node index',
        ignore: [
            'assets',
            'jspm_packages',
            'node_modules',
            'package.json',
            'gulpfile.js',
            'src',
            'output'
        ]
    });
});

Gulp.task('clean', () => {
    return Gulp.src([
        'output/',
        '*.log',
        'server-*',
        'assets/css/'
    ], { read: false, allowEmpty: true }).pipe(Clean());
});

Gulp.task('build', Gulp.parallel('dashcss'));

Gulp.task('debug', Gulp.series('build', Gulp.parallel('watchscss', 'rundbg')));

Gulp.task('default', Gulp.series('debug'));
