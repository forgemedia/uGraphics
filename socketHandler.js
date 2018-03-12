import Winston from 'winston';
import { io } from './server';
import FS from 'fs';
import _ from 'lodash';
import Config from './config';

/**
 * The central/master sync data store for all of the components
 * @type {Object}
 */
export let dataStore = {};
for (let socket of Config.sockets)
    dataStore[socket] = Config.initDataStore[socket] || {};

/**
 * Emits a sync state for the named component
 * @param {string} socketName The name of the component
 * @param {Object} [delta] If present, will emit only this as a delta object
 */
export let emitSynf = (socketName, delta) => {
    // Emit it over socket
    io.emit(`${socketName}:synf`, delta || dataStore[socketName]);

    // Log it
    Winston.debug(`Emitted ${socketName}:synf: ${delta? '(delta) ' + JSON.stringify(delta) : JSON.stringify(dataStore[socketName])}`);
};

/**
 * Emits a trigger message for the named component
 * @param {string} socketName The name of the component
 * @param {Object} msg The object to emit as accompanying data
 */
export let emitTrigger = (socketName, msg) => {
    // Emit it over socket
    io.emit(`${socketName}:trigger`, msg);

    // Log it
    Winston.debug(`Emitted ${socketName}:trigger: ${JSON.stringify(msg)}`);
};

/** Sets up a sixty-second tick interval to keep the system in sync */
export let setTick = () => {
    // Every n seconds, emit a sync event for each socket
    setInterval(() => {
        Winston.verbose('Tick');
        for (let socketName of Config.sockets) emitSynf(socketName);
    }, 60000);
};

/**
 * Called whenever a socket needs to be handled
 * @param {socket} socket The socket that needs to be handled
 */
export let handleSocket = socket => {
    // Get the IP address that's connecting and log it
    let address = socket.request.connection.remoteAddress;
    Winston.verbose(`Connection from ${address}`);
    
    // For each socket defined in config.json, set a method to handle it
    for (let socketName of Config.sockets) {
        // When a sync message is received...
        socket.on(`${socketName}:sync`, msg => {
            // Log it
            Winston.debug(`Sync on ${socketName}:sync: ${JSON.stringify(msg)}`);

            // Assign the received message into the respective data store
            _.assign(dataStore[socketName], msg);

            // Emit it again on the same socket so other clients can pick it up
            emitSynf(socketName, msg);
        });

        // When a get message is received...
        socket.on(`${socketName}:get`, () => {
            // Log it
            Winston.debug(`Get  on ${socketName}:get`);

            // Emit the relevant state from the data store again
            emitSynf(socketName);
        });

        // When a trigger message is received...
        socket.on(`${socketName}:trigger`, msg => {
            // Log it
            Winston.debug(`Trig on ${socketName}:trigger: ${msg.id}, ${msg.data}`);

            // Pass it on
            emitTrigger(socketName, msg);
        });
    }
};
