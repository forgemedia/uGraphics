import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';
import fgAnimate from './animate.js';

// The data store backing object, which is written to through a proxy object
// so that assignments can be trapped
let dataStoreBacking = {};
let inProgress = {};

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
        this.cgSetSocketHandlers();

        $(() => this.io.emit(`${this.name}:get`));
    }

    // Function that sets up socket message handler functions
    cgSetSocketHandlers() {
        // When a sync message is received...
        this.io.on(`${this.name}:sync`, msg => {
            // Send a log to the console for debugging purposes
            console.log(`${this.name}: received ${this.name}:sync, ${JSON.stringify(msg)}`);

            // Use _.assign to merge the received state into the local data store
            _.assign(this.dataStore, msg);
        });

        // When a trigger message is received...
        this.io.on(`${this.name}:trigger`, msg => {
            // Send a log to the console for debugging purposes
            console.log(`${this.name}: received ${this.name}: trigger, ${JSON.stringify(msg)}`);

            // Keep a record of the event id contained in the msg object
            let id = msg.id;

            // If there's a suitable element to animate, trigger the animation for
            // that element
            let elementToAnimate = $(`[fg-trigger-anim='${id}']`);
            if (elementToAnimate) this.cgTriggerAnimate(
                id,
                elementToAnimate,
                msg.data,
                elementToAnimate.attr('fg-anim-duration') || 5000
            );

            // Otherwise, if there's a corresponding method, execute it, passing
            // the data contained in the msg object as the only argument
            else if (this.methods[id]) this.methods[id](msg.data);
        });
    }

    // Function to automate various parts of graphic when a trigger
    // group thingy is received
    cgTriggerAnimate (
        id,
        elem,
        data,
        hideDelay = 5000,
        customFn = () => {}
    ) {
        // Return if the delay's less than 200 ms or there
        // is a marker saying this graphic is currently
        // in progress
        if (hideDelay < 200 || inProgress[id]) {
            console.log(`${this.name}: the graphic ${id} is currently in progress`);
            return;
        }

        // Otherwise, start by marking this graphic as in progress
        inProgress[id] = true;

        console.log(`${this.name}: cgTriggerAnimate for id ${id}, hideDelay ${hideDelay}`);

        // Automatically set the values of relevant DOM elements
        for (let item in data) {
            $(`[fg-trigger-data='${item}']`).text(data[item]);
        }

        // Animate the element in
        fgAnimate(elem, true);

        // Execute any custom code
        customFn();

        // After the specified delay, animate the element out and
        // unmark the graphic as being in progress
        setTimeout(() => {
            fgAnimate(elem, false);
            inProgress[id] = false;
        }, hideDelay);
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
