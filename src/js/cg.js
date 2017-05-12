// Package imports
import SocketIO from 'socket.io-client';
import Rivets from 'rivets';

// Custom module imports
import FGShow from './cg/fgshow';
import BugCtrl from './cg/bug';

Rivets.binders.fgshow = FGShow;

// A list of controllers
let controllers = {
    bug: BugCtrl
};

// A list of bindings (not currently used for anything, but may be used in future)
let bindings = {};

// Bind all the controllers
for (let id in controllers)
    bindings[id] = new controllers[id](id);

// Connect to sockets
let io = SocketIO.connect();

// When the document is ready ($()), show the body element,
// which is hidden in CSS
$(() => {
    $('body').show();
});

// Export io (not currently working)
export { io as IO };
