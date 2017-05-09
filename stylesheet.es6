import Path from 'path';
import Cssnext from 'postcss-cssnext';
import Cssnano from 'cssnano';
import SassMiddleware from 'node-sass-middleware';
import PostCSSMiddleware from 'postcss-middleware';

import Config from './config';
import { Debug } from './server';

// - STYLESHEET PROCESSING -----------------------------------------------------
// List PostCSS plugins
let postCSSPlugins = [
    Cssnext({
        browsers: Config.BrowserSupport
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
        response: false
    }));
    app.use(PostCSSMiddleware({
        src: req => Path.join(__dirname, 'output', 'scss', req.url),
        plugins: postCSSPlugins
    }));
}
