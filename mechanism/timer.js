import _ from 'lodash';
import { logger } from '../server';

export default (data, dataStore, callback) => {
    if (!dataStore.timer) dataStore.timer = {};

    let init = data => {
        dataStore.timer[data.id] = {
            counter: 0,
            direction: 'up'
        };
    };

    let set = data => {
        logger.debug(`Timer mechanism: assigning settings ${JSON.stringify(data.settings)} to dataStore ${data.id}`);
        logger.silly(`The data is ${JSON.stringify(data)}`);
        _.assign(dataStore.timer[data.id], data.settings);
    };

    switch (data.op) {
        case 'init': init(data); break;
        case 'set': set(data); break;
        default: break;
    }

    callback();
};
