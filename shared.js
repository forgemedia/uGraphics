/**
 * Is the debug environment variable set? Used to set up some useful development things
 * @type {boolean}
 */
let Debug = process.env.UGR_ENV == 'debug';

/**
 * The current working directory
 * @type {string}
 */
let CWD = process.cwd();

export { Debug, CWD };
