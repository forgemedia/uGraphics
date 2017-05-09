// -----------------------------------------------------------------------------
// - IMPORTS -------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Import modules from npm/node
import Path from 'path';
import Express from 'express';
import Yargs from 'yargs';
import Winston from 'winston-color';

// Import config and modules from project
import Config from './config';
import DashRouter from './dash.router';
import * as StylesheetMiddleware from './stylesheet';

let debug = process.env.NODE_ENV == 'debug';

// -----------------------------------------------------------------------------
// - SERVER OPTIONS ------------------------------------------------------------
// -----------------------------------------------------------------------------
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

StylesheetMiddleware.Sass(app);

// - SERVER --------------------------------------------------------------------
// Serve static directories
for (let pub in Config.publicDirs)
    app.use(`/${pub}`, Express.static(Path.join(__dirname, Config.publicDirs[pub])));

// Use the dashboard router module to handle the dashboard view
app.use(['/dash', '/dashboard'], DashRouter);

// Start the Express app listening on the specified port
app.listen(settings.port, () => {
    Winston.info(`Forge Graphics Dashboard ${Config.project}`)
    Winston.info(`Listening on port ${settings.port}`);
    Winston.debug('Debug enabled');
});

export default debug;
