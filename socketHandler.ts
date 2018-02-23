import * as Winston from 'winston';
import { IO } from './server';
import * as FS from 'fs';
import * as _ from 'lodash';
const Config = JSON.parse(FS.readFileSync('./config.json').toString());

// Store all the datas
let dataStore = {};
for (let socket of Config.sockets)
    dataStore[socket] = Config.initDataStore[socket] || {};

// Called when a state for a component needs to be emitted
let emitSynf = (socketName, delta?) => {
    // Emit it over socket
    IO.emit(`${socketName}:synf`, delta || dataStore[socketName]);

    // Log it
    Winston.debug(`Emitted ${socketName}:synf: ${delta? '(delta) ' + JSON.stringify(delta) : JSON.stringify(dataStore[socketName])}`);
};

// Called when a trigger message needs to be emitted
let emitTrigger = (socketName, msg) => {
    // Emit it over socket
    IO.emit(`${socketName}:trigger`, msg);

    // Log it
    Winston.debug(`Emitted ${socketName}:trigger: ${JSON.stringify(msg)}`);
};

let setTick = () => {
    // Every n seconds, emit a sync event for each socket
    setInterval(() => {
        Winston.verbose('Tick');
        for (let socketName of Config.sockets) emitSynf(socketName);
    }, 10000);
};

// Called in server.ts when any connection is received
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

export {
    handleSocket as HandleSocket,
    emitSynf as EmitSynf,
    emitTrigger as EmitTrigger,
    setTick as SetTick
};
