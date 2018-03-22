export default (data, dataStore, callback) => {
    if (!dataStore.timer) dataStore.timer = {};
    if (!dataStore.timer[data.id]) dataStore.timer[data.id] = {};
    let ctimer = dataStore.timer[data.id];

    let set = data => {
        ctimer.counter = data.counter || 0;
    };

    switch (data.op) {
        case 'set': set(data); break;
        default: break;
    }

    callback();
};
