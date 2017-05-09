// -----------------------------------------------------------------------------
// - IMPORTS -------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Import modules from npm/node
import Path from 'path';
import Express from 'express';
import Yargs from 'yargs';
import Winston from 'winston-color';

// Import Express middleware to compile/transform stylesheets
import SassMiddleware from 'node-sass-middleware';
import PostCSSMiddleware from 'postcss-middleware';

// Import PostCSS plugins
import Cssnext from 'postcss-cssnext';
import Cssnano from 'cssnano';

// Import config and modules from project
import Config from './config.json';
import DashRouter from './dash.router';


// -----------------------------------------------------------------------------
// - SERVER OPTIONS ------------------------------------------------------------
// -----------------------------------------------------------------------------
    let debug = process.env.NODE_ENV == 'debug';
    Winston.level = debug? 'debug' : 'info';

    // Parse command line options with Yargs, taking defaults from config.json
    let settings = Yargs
        .option('port', {
            alias: 'p',
            describe: 'Port to listen on',
        type: 'number'
    })
    .default(Config.defaults)
    .usage(`Forge Graphics Server (${Config.project})\nUsage: $0 [-p port]`)
    .help().alias('h', 'help')
    .argv;


// -----------------------------------------------------------------------------
// - EXPRESS APP ---------------------------------------------------------------
// -----------------------------------------------------------------------------
// Create an Express app, using Pug as the view engine
var app = Express();
app.set('view engine', 'pug');

// - STYLESHEET PROCESSING -----------------------------------------------------
// List PostCSS plugins
let postCSSPlugins = [
    Cssnext({
        browsers: Config.BrowserSupport
    })
];
if (debug) postCSSPlugins.push(
    Cssnano({
        autoprefixer: false
    })
);

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

// - SERVER --------------------------------------------------------------------
// Serve static directories
for (let url of Config.publicDirs)
    app.use(`/${url}`, Express.static(Path.join(__dirname, url)));

// Use the dashboard router module to handle the dashboard view
app.use(['/dash', '/dashboard'], DashRouter);

// Start the Express app listening on the specified port
app.listen(settings.port, () => {
    Winston.info(`Forge Graphics Dashboard ${Config.project}`)
    Winston.info(`Listening on port ${settings.port}`);
});
