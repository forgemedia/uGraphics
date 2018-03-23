import _ from 'lodash';
import { logger } from '../server';
import { emitSynf } from '../socketHandler';

let timerIntervals = {};
let timerSubscriptions = {};
let timerGlobalTick = setInterval(() => {
    for (let sub in timerSubscriptions) {
        let subscription = timerSubscriptions[sub];
        let timer = subscription.timerStore;
        switch (timer.direction) {
            case '>':
                timer.counter++;
                break;
            case '<': default:
                timer.counter--;
                break;
        }
        if (timer.counter == timer.limiter && timer.lmode == 'hard') unsubscribe(subscription.data.id);
        subscription.callback(true);
    }
}, 1000);
let subscribe = (data, dataStore, callback) => {
    if (timerSubscriptions[data.id]) return;
    timerSubscriptions[data.id] = {
        data: data,
        timerStore: dataStore.timer[data.id],
        callback: callback
    };
};
let unsubscribe = id => {
    delete timerSubscriptions[id];
};

export default (data, dataStore, callback) => {
    if (!dataStore.timer) dataStore.timer = {};

    let halt = id => {
        logger.verbose(`Timer mechanism: halt timer ${id}`);
        clearInterval(timerIntervals[id]);
        timerIntervals[id] = null;
    };

    let methods = {
        init: data => {
            logger.verbose(`Timer mechanism: Init timer ${data.id}`);
            logger.silly(`Timer mechanism: Timer ${data.id} data ${JSON.stringify(data)}`);
            dataStore.timer[data.id] = {
                counter: 0,
                direction: '>',
                limiter: 0,
                lmode: 'none',
                get overtime() {
                    return this.lmode == 'soft'
                    && (this.direction == '>'?
                        this.counter > this.limiter
                    :   this.counter < this.limiter);
                }
            };
        },
        set: data => {
            logger.debug(`Timer mechanism: assigning settings ${JSON.stringify(data.settings)} to dataStore ${data.id}`);
            logger.silly(`Timer mechanism: The data is ${JSON.stringify(data)}`);
            _.assign(dataStore.timer[data.id], data.settings);
        },
        run: data => {
            subscribe(data, dataStore, callback);
        },
        halt: data => {
            unsubscribe(data.id);
        }
    };

    (methods[data.op] || (() => {
        logger.debug(`Timer mechanism: received invalid op ${data.op} for ${data.id}`);
    })) (data);

    callback();
};
