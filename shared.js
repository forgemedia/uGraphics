import FS from 'fs';
import Yargs from 'yargs';

/**
 * Is the debug environment variable set? Used to set up some useful development things
 * @type {boolean}
 */
export let Debug = process.env.UGR_ENV == 'debug';

/**
 * The current working directory
 * @type {string}
 */
export let CWD = process.cwd();

export let Config = {};
let ConfigPath = '';
export let argv = {};

/** The command-line arguments as read in with Yargs */
export let ParseArgs = () => Yargs
    .option('config', {
        alias: 'c',
        describe: 'The config file to load',
        type: 'string'
    })
    .option('port', {
        alias: 'p',
        describe: 'Port to listen on',
        type: 'number'
    })
    .default({
        port: 3000,
        config: 'config.json'
    })
    .usage(`Forge Graphics Server \nUsage: $0 [-c config] [-p port]`)
    .help().alias('h', 'help')
    .argv;

export function LoadConfig(path) {
    if (!path) Config = JSON.parse(FS.readFileSync(argv.config));
    else {
        ConfigPath = path;
        Config = JSON.parse(FS.readFileSync(ConfigPath));
    }
}

argv = ParseArgs();
LoadConfig();
