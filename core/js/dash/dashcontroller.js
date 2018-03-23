import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';
import _ from 'lodash';

let name;
let io;
let dataStore;
let subscriptions = {};

/** Manually sync up the data store in cases where we know the bindings won't work */
let emitStore = () => {
    console.debug(`${name}: emitting store`);
    io.emit(`${name}:sync`, dataStoreBacking);
};

/** The data store backing object */
let dataStoreBacking = {
    methods: {
        emitStore: emitStore
    }
};

/** The method store backing object */
let methodsBacking = {};

let padNum = (num, len) => num.toString().padStart(len, '0');
let formatMinutes = seconds => {
    if (seconds === null || seconds === undefined) return '--:--';
    let negative = seconds < 0;
    if (negative) seconds *= -1;
    let minutes = Math.floor(seconds / 60);
    seconds %= 60;
    return `${negative? '-' : ''}${padNum(minutes || 0, 2)}:${padNum(seconds || 0, 2)}`;
};

/**
 * Dashboard controller class
 *
 * Each dashboard tab corresponds to an instance of this controller
 */
export default class dashController {
    /**
     * @param {string} id The ID of the controller
     */
    constructor(id) {
        console.debug(`${id}: constructing controller`);

        /** The element that will contain the contents of the controller template -
         * has an `fg-panel` attribute corresponding to the ID of the controller
         */
        this.element = $(`[fg-panel='${id}']`);
        name = this.name = id;
        io = SocketIOClient.connect();

        /** A proxy that writes to the methods store backing */
        this.methods = new Proxy(methodsBacking, this.methodsStoreTraps);

        /** A proxy that writes to the data store backing */
        dataStore = this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);

        Rivets.formatters.not = value => !value; // Not
        Rivets.formatters.shc = (i, a) => i || a; // Or short circuit
        Rivets.formatters.cond = (i, a, b) => i? a : b; // Ternary conditional
        Rivets.formatters.minutes = formatMinutes;

        /** A Rivets binding between the controller and its container element,
         * which uses the data store proxy as its data model
         */
        this.view = Rivets.bind(this.element, this.dataStore);

        // Set up functions that handle socket messages
        this.setSocketHandlers();
        
        // Set up buttons that handle copying values of fg-copy elements
        // into the main state data store
        this.setButtons();

        // When the document's ready ($()), emit a 'get' socket message that will
        // cause the server to emit a sync message with the component's state
        $(() => io.emit(`${name}:get`));
    }

    /** Trap functions used by the data store proxy to
     * handle access to the data store backing object
     */
    get dataStoreTraps() {
        return {
            set: function(target, property, value, receiver) {
                console.debug(`${name}: data store trap, setting property ${property} to value ${value}`);
                // Set the target's property to the value as normal
                target[property] = value;

                let obj = {};
                obj[property] = value;

                // Emit a socket message informing the server of changes
                // and in turn causing it to sync other clients
                io.emit(`${name}:sync`, obj);

                // Return true, indicating success
                console.debug(`${name}: data store trap for ${property} complete`);
                return true;
            }
        };
    }

    /** Trap functions used by the method store proxy
     * to handle access to the method store backing object
     */
    get methodsStoreTraps() {
        return {
            set: function(target, property, value, receiver) {
                console.debug(`${name}: methods store trap, setting property ${property} to value ${value}`);
                // If the value assigned is not a function, return false,
                // indicating failure
                if (typeof value !== 'function') {
                    console.debug(`${name}: methods store trap: ${value} is not a function`);
                    return false;
                }

                // Set the target's property to the value as normal
                target[property] = value;

                // For any DOM element with an fg-click attribute set
                // to the name of the method being assigned,
                // disable any click event handler that is in place
                // and add a new click event handler pointing to
                // the new method
                $(`[fg-click='${property}']`).off('click').click(target[property]).each(
                    n => console.debug(`${name}: reassigning click handler for ${n}`));

                // Return true, indicating success
                console.debug(`${name}: methods store trap for ${property} complete`);
                return true;
            }
        };
    }


    /**
     * Copies a value from an fg-copy element to the main state data store
     * @param {string} id The ID of the value to copy
     */
    copyValue(id) {
        console.debug(`${name}: copying value ${id}`);

        // Does what it says on the tin
        this.dataStore[id] = $(`[fg-copy='${id}']`).val();
    }

    /**
     * Sets up all the controller's elements with an `fg-copy-button` attribute
     * to copy the corresponding value using {@link copyValue}
     */
    setButtons() {
        console.debug(`${name}: setting buttons`);

        // For singular copy buttons
        this.element.find('[fg-copy-button]').each((i, v) => {
            // Find the element and get the name of the field it'll copy
            let elem = $(v);
            let copyId = elem.attr('fg-copy-button');

            console.debug(`${name}: found fg-copy-button for copyId ${copyId}`);
            elem.click(() => {
                console.debug(`${name}: fg-copy-button clicked for copyId ${copyId}`);
                
                // On click, copy the field
                this.copyValue(copyId);
            });
        });

        this.element.find('[fg-copy-button-group]').each((i, v) => {
            // Find the element and get the name of the group it copies
            let elem = $(v);
            let copyGroup = elem.attr('fg-copy-button-group');

            console.debug(`${name}: found fg-copy-button for copyGroup ${copyGroup}`);
            elem.click(() => {
                // On click
                console.debug(`${name}: fg-copy-button-group clicked for copyGroup ${copyGroup}`);

                // Find all inputs that share that group
                this.element.find(`[fg-copy-group="${copyGroup}"]`).each((ia, va) => {
                    // Find the element and get the name of the copy field it's bound to
                    let elem_a = $(va);
                    let copyId = elem_a.attr('fg-copy');

                    console.debug(`${name}: find fg-copy-group= copyGroup ${copyGroup}, copyId ${copyId}`);
                    // Copy the field
                    this.copyValue(copyId);
                });
            });
        });

        this.element.find('[fg-trigger-button-group]').each((i, v) => {
            // Find the element and get the name of the trigger group it belongs to
            let elem = $(v);
            let triggerGroup = elem.attr('fg-trigger-button-group');

            console.debug(`${name}: found fg-trigger-button for triggerGroup ${triggerGroup}`);
            elem.click(() => {
                let data = {};
                console.debug(`${name}: fg-trigger-button-group clicked for triggerGroup ${triggerGroup}`);

                this.element.find(`[fg-trigger-group="${triggerGroup}"]`).each((ia, va) => {
                    let elem_a = $(va);
                    let triggerId = elem_a.attr('fg-trigger');

                    console.debug(`${name}: find fg-trigger-group triggerGroup ${triggerGroup}, triggerId ${triggerId}`);
                    data[triggerId] = $(`[fg-trigger='${triggerId}']`).val();
                });

                this.trigger(triggerGroup, data);
            });
        });

        this.element.find('[fg-trigger]').each((i, v) => {
            let elem = $(v);
            let triggerId = elem.attr('fg-trigger');

            console.debug(`${name}: found fg-trigger for triggerId ${triggerId}`);
            elem.click(() => {
                console.debug(`${name}: fg-trigger clicked for triggerId ${triggerId}`);

                this.trigger(triggerId);
            });
        });
    }

    /** Sends a trigger message
     * @param {string} id The ID of the message to send
     * @param {Object} data The data to be sent
     */
    trigger(id, data) {
        console.debug(`${name}: trigger id ${id}, data ${JSON.stringify(data)}`);
        io.emit(`${name}:trigger`, _.assign({ id: id, data: data || null}));
    }

    mechanism(id, data) {
        console.debug(`${name}: mechanism id ${id}, data ${JSON.stringify(data)}`);
        io.emit(`${name}:mechanism`, _.assign({ id: id, data: data || null }));
    }

    replySubscribe(id, callback) {
        if (!subscriptions[id]) subscriptions[id] = [];
        return subscriptions[id].push(callback);
    }

    /** Sets up socket message handler functions for the controller */
    setSocketHandlers() {
        // When a sync message is received...
        io.on(`${name}:synf`, msg => {
            console.debug(`${name}: received synf, ${JSON.stringify(msg)}`);

            // Use _.assign to merge the received state into the local data store
            _.assign(dataStoreBacking, msg);

            // Set the value of each fg-copy element to the corresponding value
            // from the model
            $(`[fg-copy]`).each((i, v) => {
                let elem = $(v);
                let model = elem.attr('fg-copy');
                elem.val(this.dataStore[model]);
            });
        });

        io.on(`${name}:reply`, msg => {
            console.debug(`${name}: received reply, ${JSON.stringify(msg)}`);
            let id = msg.id;
            if (subscriptions[id])
                for (let callback of subscriptions[id])
                    callback(msg.data);
        });
    }
}
