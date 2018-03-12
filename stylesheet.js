import Path from 'path';
import Cssnext from 'postcss-cssnext';
import Cssnano from 'cssnano';
import PostCSSMiddleware from 'postcss-middleware';
import Stylus from 'stylus';
import FS from 'fs';

import Config from './config';
import { Debug, CWD } from './shared';

// - STYLESHEET PROCESSING -----------------------------------------------------
/** The plugins that PostCSS should use when postprocessing */
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

/**
 * Sets up an Express app to serve up compiled and postprocessed Stylus stylesheets
 * @param {express} app The app to be configured
 */
export let Styl = app => {
    app.use(Stylus.middleware({
        src: Path.join(CWD, 'src'),
        dest: Path.join(CWD, 'output'),
        compile: (str, path) => Stylus(str)
            .set('filename', path)
            .set('include css', true)
            .set('paths', Config.frontend.stylIncludePaths)
    }));
    app.use('/output/styl', PostCSSMiddleware({
        src: req => Path.join(CWD, 'output', 'styl', req.url),
        plugins: postCSSPlugins
    }));
}