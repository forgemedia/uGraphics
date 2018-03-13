import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';
import cgAnimate from './cgAnimate.js';

/** The data store backing object */
let dataStoreBacking = {};

/** Graphics that are currently in progress */
let inProgress = {};

let animateElement = (property, show) => {
    $(`[fg-show=${property}]`).each((i, v) => {
        // $(v).find('[fg-show]').each((ai, av) => {
        //     cgAnimate(av, dataStoreBacking[$(av).attr('fg-show')]);
        // });
        cgAnimate(v, show)
    });
}

/**
 * Character generator controller class
 */
export default class CGController {
    /**
     * @param {string} id The ID of the controller
     */
    constructor (id) {
        /** The element that will contain the contents of the controller template -
         * has an `fg-component` attribute corresponding to the ID of the controller
         */
        this.element = $(`[fg-component='${id}']`);

        /** A proxy that writes to the data store backing */
        this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);

        /** Methods that are called when trigger messages are received */
        this.methods = {};

        /** The ID of the controller */
        this.name = id;
        /** The socket.io client */
        this.io = SocketIOClient.connect();

        // Bind the controller to the element, using the data store proxy
        // as the data model
        Rivets.bind(this.element, this.dataStore);
        
        // Call the method to set up the handlers that handle socket messages
        this.cgSetSocketHandlers();

        $(() => this.io.emit(`${this.name}:get`));
    }

    /** Sets up socket message handler functions for the controller */
    cgSetSocketHandlers() {
        // When a sync message is received...
        this.io.on(`${this.name}:synf`, msg => {
            // Send a log to the console for debugging purposes
            console.log(`${this.name}: received ${this.name}:synf, ${JSON.stringify(msg)}`);

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

    /** Automates various parts of a graphic animation when a trigger group
     * is received
     * @param {string} id The ID of the animation
     * @param {element} elem The element to animate
     * @param {Object} data The data used in the animation
     * @param {Number} [hideDelay=5000] The duration of the animation before hiding the element, in ms
     * @param {function} [customFn=()=>{}] A custom function to execute
     */
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
        cgAnimate(elem, true);

        // Execute any custom code
        customFn();

        // After the specified delay, animate the element out and
        // unmark the graphic as being in progress
        setTimeout(() => {
            cgAnimate(elem, false);
            inProgress[id] = false;
        }, hideDelay);
    }

    /** Trap functions used by the data store proxy to
     * handle access to the data store backing object
     */
    get dataStoreTraps() {
        return {
            // On assignment
            set: function (target, property, value, receiver) {
                console.log(`${name}: data store trap, setting property ${property} to value ${value}`);
                // Assign the value to the target object's property as usual
                target[property] = value;

                // Animate any DOM element that has an fg-show attribute
                // that binds it to this property
                animateElement(property, value);

                // Return true, indicating success
                console.log(`${name}: data store trap for ${property} complete`);
                return true;
            }
        }
    }
}
