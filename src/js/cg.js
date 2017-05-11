import SocketIO from 'socket.io-client';
import Rivets from 'rivets';

import * as BugCtrl from './cg/bug';

let controllers = {
    bug: BugCtrl
};

let bindings = {};

for (let id in controllers)
    bindings[id] = controllers[id].Bind(`[fg-component='${id}']`);

let io = SocketIO.connect();

export { io as IO };
