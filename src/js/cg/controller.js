import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';
import fgAnimate from './animate.js';

// The data store backing object, which is written to through a proxy object
// so that assignments can be trapped
let dataStoreBacking = {};

export default class CGController {
    constructor (id) {
        // The relevant element is one with an fg-component attribute corresponding
        // to this controller's name/id
        this.element = $(`[fg-component='${id}']`);

        // A proxy that handles writing to and from the data store backing,
        // using traps defined below
        this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);

        // A list of methods that are called when trigger messages are sent
        this.methods = {};

        this.name = id;
        this.io = SocketIOClient.connect();

        // Bind the controller to the element, using the data store proxy
        // as the data model
        Rivets.bind(this.element, this.dataStore);
        
        // Call the method to set up the handlers that handle socket messages
        this.setSocketHandlers();

        $(() => this.io.emit(`${this.name}:get`));
    }

    // Function that sets up socket message handler functions
    setSocketHandlers() {
        // When a sync message is received...
        this.io.on(`${this.name}:sync`, msg => {
            // Send a log to the console for debugging purposes
            console.log(`Received ${this.name}:sync, ${msg}`);

            // Use _.assign to merge the received state into the local data store
            _.assign(this.dataStore, msg);
        });

        // When a trigger message is received...
        this.io.on(`${this.name}:trigger`, msg => {
            // Send a log to the console for debugging purposes
            console.log(`Received ${this.name}: trigger, ${msg}`);

            // Keep a record of the event id contained in the msg object
            let id = msg.id;

            // If there's a corresponding method, execute it, passing
            // the data contained in the msg object as the only argument
            if (this.methods[id]) this.methods[id](msg.data);
        });
    }

    // Traps that handle accessing the data store backing object
    get dataStoreTraps() {
        return {
            // On assignment
            set: function (target, property, value, receiver) {
                // Assign the value to the target object's property as usual
                target[property] = value;

                // Animate any DOM element that has an fg-show attribute
                // that binds it to this property
                $(`[fg-show='${property}`).each((i, v) => fgAnimate(v, value));

                // Return true, indicating success
                return true;
            }
        }
    }
}
