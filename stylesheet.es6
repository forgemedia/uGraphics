import Path from 'path';
import Cssnext from 'postcss-cssnext';
import Cssnano from 'cssnano';
import SassMiddleware from 'node-sass-middleware';
import PostCSSMiddleware from 'postcss-middleware';
import Stylus from 'stylus';

import Config from './config';
import { Debug } from './server';

// - STYLESHEET PROCESSING -----------------------------------------------------
// List PostCSS plugins
let postCSSPlugins = [
    Cssnext({
        browsers: Config.frontend.browserSupport
    })
];
if (Debug) postCSSPlugins.push(
    Cssnano({
        autoprefixer: false
    })
);

export let Sass = app => {
    // Use the stylesheet middleware
    app.use(SassMiddleware({
        src: Path.join(__dirname, 'src', 'scss'),
        dest: Path.join(__dirname, 'output', 'scss'),
        prefix: '/output/scss',
        response: false,
        includePaths: Config.frontend.sassIncludePaths
    }));
    app.use('/output/scss', PostCSSMiddleware({
        src: req => Path.join(__dirname, 'output', 'scss', req.url),
        plugins: postCSSPlugins
    }));
}

export let Styl = app => {
    app.use(Stylus.middleware({
        src: Path.join(__dirname, 'src'),
        dest: Path.join(__dirname, 'output'),
        compile: (str, path) => Stylus(str)
            .set('filename', path)
            .set('include css', true)
            .set('paths', [
                'node_modules/'
            ])
    }));
    app.use('/output/styl', PostCSSMiddleware({
        src: req => Path.join(__dirname, 'output', 'styl', req.url),
        plugins: postCSSPlugins
    }));
}
