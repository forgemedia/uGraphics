import * as Path from 'path';
import * as Cssnext from 'postcss-cssnext';
import * as Cssnano from 'cssnano';
import * as PostCSSMiddleware from 'postcss-middleware';
import * as Stylus from 'stylus';
import * as FS from 'fs';

import { CWD, Debug } from './server';

const Config = JSON.parse(FS.readFileSync('./config.json').toString());

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
