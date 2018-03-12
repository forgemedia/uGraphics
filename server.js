// -----------------------------------------------------------------------------
// - IMPORTS -------------------------------------------------------------------
// -----------------------------------------------------------------------------
console.log('Server entry point');
import Config from './config';
import { CWD as cwd, Debug as debug } from './shared';

// Import modules from npm/node
import Path from 'path';
import HTTP from 'http';
import Express from 'express';
import Yargs from 'yargs';
import Winston from 'winston';
import SocketIOServer from 'socket.io';
import Moment from 'moment';
import _ from 'lodash';
import FS from 'fs';
import Vorpal from 'vorpal';
import 'pug'; // So that pkg works

// Import config and modules from project
import DashRouter from './dashrouter';
import * as StylesheetMiddleware from './stylesheet';
import * as SocketHandler from './socketHandler';

// -----------------------------------------------------------------------------
// - SERVER OPTIONS ------------------------------------------------------------
// -----------------------------------------------------------------------------
console.log('Imports complete, configuring Winston');
let consoleTransport = new Winston.transports.Console({
    format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.printf(info => `${info.level}: ${info.message}`))
});
export let logger = Winston.createLogger({
    transports: [ consoleTransport ],
    level: debug? 'silly' : 'info'
});

logger.info(`Forge Graphics Server Gen3 (${Config.locals.product} - ${Config.locals.project})`)
logger.info(`Time of start: ${Moment().format('ddd DD MMM YYYY, HH:mm:ss ZZ')}`)

// Parse command line options with Yargs, taking defaults from config.json
logger.silly(`Parsing command-line options`);
/** The command-line arguments as read in with Yargs */
let argv = Yargs
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
logger.silly(`Configuring Express app`);
/** The Express app powering the dashboard and character generator */
export let app = Express();
/** The HTTP server that serves up {@link app} */
export let server = HTTP.createServer(app);
app.set('view engine', 'pug');
app.set('view options', { debug: false });
app.locals = _.assign(Config.locals, { ugr_debug: debug });

// Pass the app to functions that install middleware which processes SCSS
// and Stylus stylesheets on-demand
logger.silly(`Configuring Stylus middleware`);
StylesheetMiddleware.Styl(app);

// -----------------------------------------------------------------------------
// - SERVER --------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Serve static directories
logger.silly(`Configuring server routes`);
for (let pub in Config.publicDirs)
    app.use(`/${pub}`,
        Express.static(Path.join(cwd, Config.publicDirs[pub])));

// Use the dashboard router module to handle the dashboard view
app.use(['/dash', '/dashboard'], DashRouter);

// Render the character generator when / is accessed
app.get('/', (req, res) => res.render('cg/index'));

// Handle anything else by sending a 404 error page and a 404 status code
app.get('*', (req, res) => res.status(404).render('404'));

// -----------------------------------------------------------------------------
// - SOCKET.IO REAL-TIME COMMS -------------------------------------------------
// -----------------------------------------------------------------------------
logger.silly(`Configuring socket.io server`);
/** The socket.io real-time communications server */
export let io = SocketIOServer(server, {
    wsEngine: "ws"
});

// Start the Express app listening on the specified port
server.listen(argv.port, () => {
    // Log some stuff
    logger.info(`Listening on port ${argv.port}`);
    logger.debug('Debug enabled');

    // On any connection, handle it with the function defined in socketHandler.ts
    io.on('connection', SocketHandler.handleSocket);

    SocketHandler.setTick();
});

// -----------------------------------------------------------------------------
// - VORPAL COMMAND-LINE INTERFACE ---------------------------------------------
// -----------------------------------------------------------------------------
let vorpal = Vorpal();

vorpal.command('show <store>')
    .description('Show the contents of a module\'s data store')
    .alias('s')
    .action((args, callback) => {
        console.log(JSON.stringify(SocketHandler.dataStore[args.store] || 'Module not found' ));
        callback();
    });

vorpal.delimiter('uGraphics>').show();
consoleTransport.on('logged', () => vorpal.ui.redraw.done());
