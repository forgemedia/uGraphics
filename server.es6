// -----------------------------------------------------------------------------
// - IMPORTS -------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Import modules from npm/node
import Path from 'path';
import HTTP from 'http';
import Express from 'express';
import Yargs from 'yargs';
import Winston from 'winston-color';
import SocketIOServer from 'socket.io';

// Import config and modules from project
import Config from './config';
import DashRouter from './dash.router';
import * as StylesheetMiddleware from './stylesheet';
import SocketHandler from './socketHandler';

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
let app = Express();
let server = HTTP.createServer(app);
app.set('view engine', 'pug');
app.locals = Config.locals;

StylesheetMiddleware.Sass(app);

// - SERVER --------------------------------------------------------------------
// Serve static directories
for (let pub in Config.publicDirs)
    app.use(`/${pub}`,
        Express.static(Path.join(__dirname, Config.publicDirs[pub])));

// Use the dashboard router module to handle the dashboard view
app.use(['/dash', '/dashboard'], DashRouter);

// - SOCKET.IO REAL-TIME COMMS -------------------------------------------------
let io = SocketIOServer(server);
io.on('connection', SocketHandler);

// Start the Express app listening on the specified port
server.listen(settings.port, () => {
    Winston.info(`Forge Graphics Dashboard ${Config.project}`)
    Winston.info(`Listening on port ${settings.port}`);
    Winston.debug('Debug enabled');
});

export { debug as Debug, io as IO };
