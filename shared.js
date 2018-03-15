import FS from 'fs';

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

export let Config = LoadConfig();

export function UpdateConfig() {
    Config = LoadConfig();
}

function LoadConfig() {
    return JSON.parse(FS.readFileSync('config.json'));
}
