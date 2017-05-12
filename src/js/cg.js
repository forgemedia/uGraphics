// Package imports
import SocketIO from 'socket.io-client';
import Rivets from 'rivets';

// Custom module imports
import BugCtrl from './cg/bug';

// Hide all elements with an fg-show attribute to begin with
$('[fg-show]').each((i, v) => $(v).hide());

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

// When a maintenance trigger message is received...
io.on('maintenance:trigger', msg => {
    // Log it to the console
    console.log(`Received maintenance:trigger, ${msg}`);

    // A switch for all of the possible trigger messages
    switch(msg.id) {
        case 'reset':
            // Reset message: reload the page
            location.reload();
            break;
        default:
            // Otherwise, do nothing
            break;
    }
});
