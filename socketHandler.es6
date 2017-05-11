import Winston from 'winston-color';
import { IO } from './server';
import Config from './config';

export default socket => {
    let address = socket.request.connection.remoteAddress;
    Winston.verbose(`Connection from ${address}`);
    for (let socketName of Config.sockets)
        socket.on(`${socketName}:sync`, msg => {
            Winston.debug(`Sync on ${socketName}: ${JSON.stringify(msg)}`);
        });
}
