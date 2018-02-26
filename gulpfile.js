'use strict';

let Gulp = require('gulp');
let Nodemon = require('gulp-nodemon');
let Env = require('gulp-env');
let Sass = require('gulp-sass');
let PostCSS = require('gulp-postcss');

let Cssnext = require('postcss-cssnext');
let Cssnano = require('cssnano');

let FS = require('fs');

const Config = JSON.parse(FS.readFileSync('./config.json').toString());

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

Gulp.task('watchscss', () => Gulp.watch('./src/scss/dash.scss', Gulp.series('dashcss')));

Gulp.task('rundbg', () => {
    Env({
        vars: {
            NODE_ENV: 'debug'
        }
    });
    Nodemon({
        ext: 'ts json',
        watch: '.',
        exec: 'ts-node server',
        ignore: [
            'assets',
            'jspm_packages',
            'node_modules',
            'package.json',
            'gulpfile.js',
            'src'
        ]
    });
});

Gulp.task('build', Gulp.parallel('dashcss'));

Gulp.task('debug', Gulp.series('build', Gulp.parallel('watchscss', 'rundbg')));

Gulp.task('default', Gulp.series('debug'));
