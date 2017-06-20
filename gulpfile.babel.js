import Gulp from 'gulp';
import Nodemon from 'gulp-nodemon';
import Env from 'gulp-env';

Gulp.task('default', () => {
    Env({
        vars: {
            NODE_ENV: 'debug'
        }
    });
    Nodemon({
        ext: 'js es6 json',
        watch: '.',
        ignore: [
            'assets',
            'jspm_packages',
            'node_modules',
            'package.json',
            'nodemon.json',
            'gulpfile.babel.js',
            'src'
        ]
    });
});
