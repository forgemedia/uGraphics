import * as Winston from 'winston';
import { IO } from './server';
import * as FS from 'fs';
const Config = JSON.parse(FS.readFileSync('./config.json').toString());

// Store all the datas
let dataStore = Config.initDataStore;

// Called when a state for a component needs to be emitted
let emitSync = socketName => {
    // Emit it over socket
    IO.emit(`${socketName}:sync`, dataStore[socketName]);

    // Log it
    Winston.debug(`Emitted ${socketName}:sync: ${JSON.stringify(dataStore[socketName])}`);
};

// Called when a trigger message needs to be emitted
let emitTrigger = (socketName, msg) => {
    // Emit it over socket
    IO.emit(`${socketName}:trigger`, msg);

    // Log it
    Winston.debug(`Emitted ${socketName}:trigger: ${JSON.stringify(msg)}`);
};

let setTick = () => {
    // Every ten seconds, emit a sync event for each socket
    setTimeout(() => {
        Winston.verbose('Tick');
        for (let socketName of Config.sockets) emitSync(socketName);
    }, 10000);
};

// Called in server.es6 when any connection is received
let handleSocket = socket => {
    // Get the IP address that's connecting and log it
    let address = socket.request.connection.remoteAddress;
    Winston.verbose(`Connection from ${address}`);
    
    // For each socket defined in config.json, set a method to handle it
    for (let socketName of Config.sockets) {
        // When a sync message is received...
        socket.on(`${socketName}:sync`, msg => {
            // Log it
            Winston.debug(`Sync on ${socketName}:sync: ${JSON.stringify(msg)}`);

            // Set dataStore[socketName] to the object received
            dataStore[socketName] = msg;

            // Emit it again on the same socket so other clients can pick it up
            emitSync(socketName);
        });

        // When a get message is received...
        socket.on(`${socketName}:get`, () => {
            // Log it
            Winston.debug(`Get  on ${socketName}:get`);

            // Emit the relevant state from the data store again
            emitSync(socketName);
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

export {
    handleSocket as HandleSocket,
    emitSync as EmitSync,
    emitTrigger as EmitTrigger,
    setTick as SetTick
};
