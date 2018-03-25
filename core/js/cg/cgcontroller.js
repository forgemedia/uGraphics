import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';
import cgAnimate from './cgAnimate.js';

/** The data store backing object */
let dataStoreBacking = {
    methods: {
        and: (a, b) => a && b,
        or: (a, b) => a || b
    }
};

/** Graphics that are currently in progress */
let inProgress = {};

let subscriptions = {};
let name = '';

let animateElement = (property, show) => {
    $(`[fg-show=${property}]`).each((i, v) => {
        // $(v).find('[fg-show]').each((ai, av) => {
        //     cgAnimate(av, dataStoreBacking[$(av).attr('fg-show')]);
        // });
        cgAnimate(v, show)
    });
};

let padNum = (num, len) => num.toString().padStart(len, '0');

/**
 * Character generator controller class
 */
export default class cgController {
    /**
     * @param {string} id The ID of the controller
     */
    constructor (id, dataAssign) {
        if (dataAssign) _.assign(dataStoreBacking, dataAssign);

        /** The element that will contain the contents of the controller template -
         * has an `fg-component` attribute corresponding to the ID of the controller
         */
        this.element = $(`[fg-component='${id}']`);

        /** A proxy that writes to the data store backing */
        this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);

        /** Methods that are called when trigger messages are received */
        this.methods = {};

        /** The ID of the controller */
        name = this.name = id;

        console.debug(`constructing controller with name ${this.name}, dataStoreBacking ${JSON.stringify(dataStoreBacking)}`);

        /** The socket.io client */
        this.io = SocketIOClient.connect();

        Rivets.binders.fgshow = (el, value) => {
            console.debug(`animate: fgshow binder for ${$(el).prop('id')}, value ${JSON.stringify(value)}`)
            cgAnimate(el, value);
        };

        Rivets.formatters.not = value => !value;
        Rivets.formatters.shc = (i, a) => i || a; // Or short circuit
        Rivets.formatters.cond = (i, a, b) => i? a : b; // Ternary conditional
        Rivets.formatters.minutes = seconds => {
            let negative = seconds < 0;
            if (negative) seconds *= -1;
            let minutes = Math.floor(seconds / 60);
            seconds %= 60;
            return `${negative? '-' : ''}${padNum(minutes || 0, 2)}:${padNum(seconds || 0, 2)}`;
        };

        // Bind the controller to the element, using the data store proxy
        // as the data model
        Rivets.bind(this.element, this.dataStore);
        
        // Call the method to set up the handlers that handle socket messages
        this.cgSetSocketHandlers();

        $(() => this.io.emit(`${this.name}:get`));
    }

    cgTriggerSubscribe(id, callback) {
        if (!subscriptions[id]) subscriptions[id] = [];
        return subscriptions[id].push(callback);
    }

    /** Sets up socket message handler functions for the controller */
    cgSetSocketHandlers() {
        // When a sync message is received...
        this.io.on(`${this.name}:synf`, msg => {
            // Send a log to the console for debugging purposes
            console.debug(`${this.name}: received ${this.name}:synf, ${JSON.stringify(msg)}`);

            // Use _.assign to merge the received state into the local data store
            _.assign(this.dataStore, msg);
        });

        // When a trigger message is received...
        this.io.on(`${this.name}:trigger`, msg => {
            // Send a log to the console for debugging purposes
            console.debug(`${this.name}: received ${this.name}:trigger, ${JSON.stringify(msg)}`);

            // Keep a record of the event id contained in the msg object
            let id = msg.id;
            if (subscriptions[id])
                for (let callback of subscriptions[id])
                    callback(msg.data);

            // If there's a suitable element to animate, trigger the animation for
            // that element
            $(`[fg-trigger-anim='${id}']`).each((i, v) => {
                let el = $(v);
                this.cgTriggerAnimate(
                id,
                el,
                msg.data,
                el.attr('fg-anim-duration') || 5000
            )
            });

            // if there's a corresponding method, execute it, passing
            // the data contained in the msg object as the only argument
            if (this.methods[id]) this.methods[id](msg.data);
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
        // Return if the delay's less than 50 ms or there
        // is a marker saying this graphic is currently
        // in progress
        if (hideDelay < 50 || inProgress[id]) {
            console.debug(`${this.name}: the graphic ${id} is currently in progress`);
            return;
        }

        // Otherwise, start by marking this graphic as in progress
        inProgress[id] = true;

        console.debug(`${this.name}: cgTriggerAnimate for id ${id}, hideDelay ${hideDelay}`);

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

    /** Sends a reply message
     * @param {string} id The ID of the message to send
     * @param {Object} data The data to be sent
     */
    reply(id, data) {
        console.debug(`${this.name}: reply id ${id}, data ${JSON.stringify(data)}`);
        this.io.emit(`${this.name}:reply`, _.assign({ id: id, data: data || null}));
    }

    /** Trap functions used by the data store proxy to
     * handle access to the data store backing object
     */
    get dataStoreTraps() {
        return {
            // On assignment
            set: function (target, property, value, receiver) {
                console.debug(`${name}: data store trap, setting property ${property} to value ${JSON.stringify(value)}`);
                // Assign the value to the target object's property as usual
                target[property] = value;

                // Animate any DOM element that has an fg-show attribute
                // that binds it to this property
                animateElement(property, value);

                // Return true, indicating success
                console.debug(`${name}: data store trap for ${property} complete`);
                return true;
            }
        }
    }
}
