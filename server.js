// -----------------------------------------------------------------------------
// - IMPORTS -------------------------------------------------------------------
// -----------------------------------------------------------------------------
console.log('Server entry point');
import * as Shared from './shared';

// Import modules from npm/node
import Path from 'path';
import FS from 'fs';
import HTTP from 'http';
import Express from 'express';
import Yargs from 'yargs';
import Winston from 'winston';
import SocketIOServer from 'socket.io';
import Moment from 'moment';
import _ from 'lodash';
import Vorpal from 'vorpal';
import Morgan from 'morgan';
import 'pug'; // So that pkg works

// Import config and modules from project
import DashRouter from './dashrouter';
import * as StylesheetMiddleware from './stylesheet';
import SHClass from './socketHandler';

// -----------------------------------------------------------------------------
// - SERVER OPTIONS ------------------------------------------------------------
// -----------------------------------------------------------------------------
console.log('Configuring Winston');
let consoleTransport = new Winston.transports.Console({
    format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.printf(info => `${info.level}: ${info.message}`))
});
let transportArray = [ consoleTransport ];
export let logger = Winston.createLogger({
    transports: transportArray,
    level: Shared.Debug? 'debug' : 'info'
});

logger.info(`Forge Graphics Server Gen3 (${Shared.Config.locals.product} - ${Shared.Config.locals.project})`)
logger.info(`Time of start: ${Moment().format('ddd DD MMM YYYY, HH:mm:ss ZZ')}`)

let logStream = {
    write: text => {
        logger.silly(_.trimEnd(text));
    }
};

// -----------------------------------------------------------------------------
// - EXPRESS APP ---------------------------------------------------------------
// -----------------------------------------------------------------------------
// Create an Express app, using Pug as the view engine
logger.silly(`Configuring Express app`);
/** The Express app powering the dashboard and character generator */
export let app = Express();
/** The HTTP server that serves up {@link app} */
export let server = HTTP.createServer(app);
app.set('views', Shared.Config.frontend.viewDirectories);
app.set('view engine', 'pug');
app.set('view options', { debug: false });
app.locals = _.assign(Shared.Config.locals, { ugr_debug: Shared.Debug, basedir: Shared.CWD });

// Pass the app to functions that install middleware which processes SCSS
// and Stylus stylesheets on-demand
logger.silly(`Configuring Stylus middleware`);
StylesheetMiddleware.Styl(app);

// -----------------------------------------------------------------------------
// - SERVER --------------------------------------------------------------------
// -----------------------------------------------------------------------------
app.use(Morgan('combined', { stream: logStream }));

// Serve static directories
logger.silly(`Configuring server routes`);
for (let pub in Shared.Config.publicDirs)
    for (let dir of Shared.Config.publicDirs[pub])
        app.use(`/${pub}`,
            Express.static(Path.join(Shared.CWD, dir)));

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

let SocketHandler = new SHClass(Shared.Config.sockets, Shared.Config.initDataStore);

// Start the Express app listening on the specified port
server.listen(Shared.argv.port, () => {
    // Log some stuff
    logger.info(`Listening on port ${Shared.argv.port}`);
    logger.debug('Debug enabled');

    // On any connection, handle it with the function defined in socketHandler.ts
    io.on('connection', SocketHandler.handleSocket);
});

// -----------------------------------------------------------------------------
// - VORPAL COMMAND-LINE INTERFACE ---------------------------------------------
// -----------------------------------------------------------------------------
let vorpal = Vorpal();

vorpal.command('show <store>')
    .description('Show the contents of a controller\'s data store')
    .alias('s')
    .action((args, callback) => {
        let store = SocketHandler.getStore(args.store) || null;
        if (store) logger.info(JSON.stringify(store)); else logger.error('Store not found');
        callback();
    });

vorpal.command('stores')
    .description('List the data stores available')
    .action((args, callback) => {
        logger.info(SocketHandler.listStores());
        callback();
    });

vorpal.command('loglevel <level>')
    .description('Show or set the Winston log level (use \'show\' to show)')
    .validate(args => ['error', 'warn', 'info', 'verbose', 'debug', 'silly', 'show'].includes(args.level) || 'Invalid log level')
    .action((args, callback) => {
        if (args.level == 'show') console.log(`'${logger.level}'`);
        else for (let transport of logger.transports) transport.level = args.level;
        callback();
    });

vorpal.command('debug')
    .description('Toggle the server debug mode')
    .action((args, callback) => {
        Shared.Debug = !Shared.Debug;
        app.locals.ugr_debug = Shared.Debug;
        callback();
    })

vorpal.delimiter('uGraphics>').show();
let redrawDebounced = _.debounce(() => { vorpal.ui.redraw.done(); }, 500);
consoleTransport.on('logged', redrawDebounced);
