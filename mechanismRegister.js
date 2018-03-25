import Timer from './mechanism/timer';

let mechanisms = {
    timer: Timer
};

export let Handle = (msg, dataStore, callback) => {
    if (!mechanisms[msg.id]) return false;
    mechanisms[msg.id](msg.data, dataStore, callback);
};
