import { Config } from './shared';

let mechanisms = {};
// dynamic module loading lol
for (let mechanism in Config.mechanisms) {
    mechanisms[mechanism] = require(`./${Config.mechanisms[mechanism]}`);
}

export let Handle = (msg, dataStore, callback) => {
    if (!mechanisms[msg.id]) return false;
    mechanisms[msg.id](msg.data, dataStore, callback);
    return true;
};
