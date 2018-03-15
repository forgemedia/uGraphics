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

export let Config = {};

export function LoadConfig(path) {
    Config = JSON.parse(FS.readFileSync(path));
}
