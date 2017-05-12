import Winston from 'winston-color';
import { IO } from './server';
import Config from './config';

// Store all the datas
let dataStore = Config.initDataStore;

let emitSync = socketName => {
    IO.emit(`${socketName}:sync`, dataStore[socketName]);
    Winston.debug(`Emitted ${socketName}:sync: ${JSON.stringify(dataStore[socketName])}`);
};

let emitTrigger = (socketName, msg) => {
    IO.emit(`${socketName}:trigger`, msg);
    Winston.debug(`Emitted ${socketName}:trigger: ${JSON.stringify(msg)}`);
};

// Called in server.es6 when any connection is received
export default socket => {
    // Get the IP address that's connecting and log it
    let address = socket.request.connection.remoteAddress;
    Winston.verbose(`Connection from ${address}`);
    
    // For each socket defined in config.json, set a method to handle it
    for (let socketName of Config.sockets) {
        // When a message is received with this socket name...
        socket.on(`${socketName}:sync`, msg => {
            // Log it
            Winston.debug(`Sync on ${socketName}:sync: ${JSON.stringify(msg)}`);
            // Set dataStore[socketName] to the object received
            dataStore[socketName] = msg;
            // Emit it again on the same socket so the character generator
            // can pick it up
            emitSync(socketName);
        });
        socket.on(`${socketName}:get`, () => {
            Winston.debug(`Get  on ${socketName}:get`);
            emitSync(socketName);
        });
        socket.on(`${socketName}:trigger`, msg => {
            Winston.debug(`Trig on ${socketName}:trigger: ${msg.id}, ${msg.data}`);
            emitTrigger(socketName, msg);
        });
    }

    socket.on('test', msg => Winston.debug(`Test socket: ${msg}`));
}
