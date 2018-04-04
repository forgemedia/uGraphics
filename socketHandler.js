import { logger, io } from './server';
import FS from 'fs';
import _ from 'lodash';
import * as MechanismRegister from './mechanismRegister';

const lockingEnabled = false;

/**
 * The central/master sync data store for all of the components
 * @type {Object}
 */
let dataStore = {};
let sockets = {};
let locks = {};
let queues = {};

/**
 * Emits a sync state for the named component
 * @param {string} socketName The name of the component
 * @param {Object} [delta] If present, will emit only this as a delta object
 */
export let emitSynf = (socketName, delta) => {
    // Emit it over socket
    io.emit(`${socketName}:synf`, delta || dataStore[socketName]);

    // Log it
    logger.silly(`Emitted ${socketName}:synf: ${delta? '(delta) ' + JSON.stringify(delta) : JSON.stringify(dataStore[socketName])}`);
};

/**
 * Emits a trigger message for the named component
 * @param {string} socketName The name of the component
 * @param {Object} msg The object to emit as accompanying data
 */
let emitTrigger = (socketName, msg) => {
    // Emit it over socket
    io.emit(`${socketName}:trigger`, msg);

    // Log it
    logger.debug(`Emitted ${socketName}:trigger: ${JSON.stringify(msg)}`);
};

/**
 * Emits a reply message for the named component
 * @param {string} socketName The name of the component
 * @param {Object} msg The object to emit as accompanying data
 */
let emitReply = (socketName, msg) => {
    // Emit it over socket
    io.emit(`${socketName}:reply`, msg);

    // Log it
    logger.debug(`Emitted ${socketName}:reply: ${JSON.stringify(msg)}`);
};

/** Sets up a sixty-second tick interval to keep the system in sync */
let setTick = () => {
    // Every n seconds, emit a sync event for each socket
    setInterval(() => {
        logger.verbose('Tick');
        for (let socketName of sockets) emitSynf(socketName);
    }, 60000);
};

let unlockDataStore = dataStoreId => {
    if (!locks[dataStoreId]) return;
    logger.debug(`Unlocking ${dataStoreId}, ${queues[dataStoreId].length} messages to process`);
    while (queues[dataStoreId].length > 0) _.assign(dataStore[dataStoreId], queues[dataStoreId].pop);
    locks[dataStoreId] = false;
    logger.debug(`Unlocked data store ${dataStoreId}`);
};

let debouncedEmitSynf = _.debounce(emitSynf, 50);

let mechanismCallbackFactory = dataStoreId => {
    return (updateOnly) => {
        logger.silly(`Mechanism callback on ${dataStoreId}${updateOnly? ', update only' : ''}`);
        if (!updateOnly) unlockDataStore(dataStoreId);
        debouncedEmitSynf(dataStoreId);
    };
};

export default class {
    constructor(isockets, initDataStore) {
        sockets = isockets;

        for (let socket of sockets) {
            dataStore[socket] = initDataStore[socket] || {};
            emitSynf(socket);
        }

        setTick();
    }

    getStore(id) {
        return dataStore[id];
    }

    listStores(id) {
        return _.keys(dataStore);
    }

    /**
     * Called whenever a socket needs to be handled
     * @param {socket} socket The socket that needs to be handled
     */
    handleSocket(socket) {
        // Get the IP address that's connecting and log it
        let address = socket.request.connection.remoteAddress;
        logger.verbose(`Connection from ${address}`);

        socket.on('telegram', msg => {
            logger.debug(`TELEGRAM: ${msg}`);
        });
        
        // For each socket defined in config.json, set a method to handle it
        for (let socketName of sockets) {
            queues[socketName] = [];
            // When a sync message is received...
            socket.on(`${socketName}:sync`, msg => {
                // Log it
                logger.silly(`Sync on ${socketName}:sync: ${JSON.stringify(msg)}`);

                // Assign the received message into the respective data store
                if (!locks[socketName]) _.assign(dataStore[socketName], msg);
                else {
                    logger.debug(`Queuing sync message for ${socketName}`);
                    queues[socketName].push(msg);
                }

                // Emit it again on the same socket so other clients can pick it up
                emitSynf(socketName, msg);
            });

            // When a get message is received...
            socket.on(`${socketName}:get`, () => {
                // Log it
                logger.debug(`Get  on ${socketName}:get`);

                // Emit the relevant state from the data store again
                emitSynf(socketName);
            });

            // When a trigger message is received...
            socket.on(`${socketName}:trigger`, msg => {
                // Log it
                logger.debug(`Trig on ${socketName}:trigger: ${msg.id}, ${JSON.stringify(msg.data)}`);

                // Pass it on
                emitTrigger(socketName, msg);
            });

            socket.on(`${socketName}:reply`, msg => {
                logger.debug(`Rply on ${socketName}:reply: ${msg.id}, ${JSON.stringify(msg.data)}`);
                emitReply(socketName, msg);
            });

            socket.on(`${socketName}:mechanism`, msg => {
                if (lockingEnabled) {
                    logger.debug(`Mechanism: locking data store ${socketName}`);
                    locks[socketName] = true;
                }
                logger.debug(`Mech on ${socketName}:mechanism: ${msg.id}, ${JSON.stringify(msg.data)}`);
                if (!MechanismRegister.Handle(msg, dataStore[socketName], mechanismCallbackFactory(socketName))) logger.error(`- Mechanism ${msg.id} not found`);
            });
        }
    };
}
