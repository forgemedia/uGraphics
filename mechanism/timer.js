import _ from 'lodash';
import { logger } from '../server';
import { emitSynf } from '../socketHandler';

let timerIntervals = {};

export default (data, dataStore, callback) => {
    if (!dataStore.timer) dataStore.timer = {};

    let methods = {
        init: data => {
            logger.verbose(`Timer mechanism: Init timer ${data.id}`);
            logger.silly(`Timer mechanism: Timer ${data.id} data ${JSON.stringify(data)}`);
            dataStore.timer[data.id] = {
                counter: 0,
                direction: '>',
                limiter: null
            };
        },
        set: data => {
            logger.debug(`Timer mechanism: assigning settings ${JSON.stringify(data.settings)} to dataStore ${data.id}`);
            logger.silly(`Timer mechanism: The data is ${JSON.stringify(data)}`);
            _.assign(dataStore.timer[data.id], data.settings);
        },
        run: data => {
            if (timerIntervals[data.id]) return;
            logger.verbose(`Timer mechanism: run timer ${data.id}`);
            timerIntervals[data.id] = setInterval(() => {
                let timer = dataStore.timer[data.id];
                switch (timer.direction) {
                    case '>': timer.counter++; break;
                    case '<': default: timer.counter--; break;
                }
                callback(true);
            }, 1000);
        },
        halt: data => {
            logger.verbose(`Timer mechanism: halt timer ${data.id}`);
            clearInterval(timerIntervals[data.id]);
            timerIntervals[data.id] = null;
        }
    };

    (methods[data.op] || (() => {
        logger.debug(`Timer mechanism: received invalid op ${data.op} for ${data.id}`);
    })) (data);

    callback();
};
