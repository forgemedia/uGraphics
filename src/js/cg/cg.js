// -----------------------------------
// - Character generator entry point
// -----------------------------------

// Package imports
import SocketIO from 'socket.io-client';
import Rivets from 'rivets';

// Custom module imports
import BugCtrl from './controllers/bug';
import LowerThirdsCtrl from './controllers/lowerThirds';
import SportsCtrl from './controllers/sport';

import Clock from './modules/clock';

console.log('cg: begin');

// Hide all elements with an fg-show attribute to begin with
console.log(`cg: hiding all [fg-show] elements`);
$('[fg-show]').each((i, v) => $(v).hide());

/** A store of controller objects */
let controllers = {
    bug: BugCtrl,
    lowerThirds: LowerThirdsCtrl,
    sport: SportsCtrl
};

/** A store of binding objects */
let bindings = {};

/** A list of module functions */
let modules = [
    Clock
];

// Bind all the controllers
for (let id in controllers) {
    console.log(`cg: setting binding for id ${id} to new controller for ${id}`);
    bindings[id] = new controllers[id](id);
}

// Connect to sockets
console.log('cg: connecting socket.io');
/** The socket.io client */
let io = SocketIO.connect();

// Really dumb way to do modules
for (let module of modules) module();

// When the document is ready ($()), show the body element,
// which is hidden in CSS
$(() => {
    console.log('cg: document ready, showing body');
    $('body').show();
});

// When a maintenance trigger message is received...
io.on('maintenance:trigger', msg => {
    // Log it to the console
    console.log(`received maintenance:trigger, ${msg}`);

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
