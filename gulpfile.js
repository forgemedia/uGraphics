let Gulp = require('gulp');
let Nodemon = require('gulp-nodemon');
let Env = require('gulp-env');

Gulp.task('default', () => {
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
