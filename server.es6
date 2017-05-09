// Import modules from npm/node
import Path from 'path';
import Express from 'express';
import Yargs from 'yargs';

// Import config and modules from project
import Config from './config.json';
import DashRouter from './dash.router';

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

// Create an Express app, using Pug as the view engine
var app = Express();
app.set('view engine', 'pug');

// Serve static directories
for (let url of [
    'assets',
    'jspm_packages'
]) app.use(`/${url}`, Express.static(Path.join(__dirname, url)));

// Use the dashboard router module to handle the dashboard view
app.use(['/dash', '/dashboard'], DashRouter);

// Start the Express app listening on the specified port
app.listen(settings.port, () =>
    console.log(`Listening on port ${settings.port}`));
