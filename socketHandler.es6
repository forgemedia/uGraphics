import Winston from 'winston-color';
import { IO } from './server';

export default socket => {
    Winston.verbose(`Connection from ${socket.handshake.address}`);
}
