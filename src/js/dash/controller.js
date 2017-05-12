import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';
import _ from 'lodash';

let io;
let name;

// Backing objects that are written to through proxies
let dataStoreBacking = {};
let methodsBacking = {};

export default class DashController {
    constructor(id) {
        // The relevant element is one with an fg-panel attribute corresponding
        // to this controller's name/id
        this.element = $(`[fg-panel='${id}']`);
        name = id;
        io = SocketIOClient.connect();
        this.io = io;

        // Proxies that write to the backing store objects above using
        // traps defined below
        this.methods = new Proxy(methodsBacking, this.methodsStoreTraps);
        this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);

        // Bind the controller to the element, using the data store proxy
        // as the data model
        this.view = Rivets.bind(this.element, this.dataStore);

        // Set up functions that handle socket messages
        this.setSocketHandlers();
        
        // Set up buttons that handle copying values of fg-copy elements
        // into the main state data store
        this.setCopyButtons();

        // When the document's ready ($()), emit a 'get' socket message that will
        // cause the server to emit a sync message with the component's state
        $(() => io.emit(`${name}:get`));
    }

    // Traps that handle access to the data store object
    get dataStoreTraps() {
        return {
            set: function(target, property, value, receiver) {
                // Set the target's property to the value as normal
                target[property] = value;

                // Emit a socket message informing the server of changes
                // and in turn causing it to sync other clients
                io.emit(`${name}:sync`, target);

                // Return true, indicating success
                return true;
            }
        }
    }

    // Traps that handle access to the method store object
    get methodsStoreTraps() {
        return {
            set: function(target, property, value, receiver) {
                // If the value assigned is not a function, return false,
                // indicating failure
                if (typeof value !== 'function') return false;

                // Set the target's property to the value as normal
                target[property] = value;

                // For any DOM element with an fg-click attribute set
                // to the name of the method being assigned,
                // disable any click event handler that is in place
                // and add a new click event handler pointing to
                // the new method
                $(`[fg-click='${property}']`).off('click').click(target[property]);

                // Return true, indicating success
                return true;
            }
        }
    }

    // Function to copy a value from an fg-copy element to the main state data store
    copyValue(id) {
        // Does what it says on the tin
        this.dataStore[id] = $(`[fg-copy='${id}']`).val();
    }

    // Function that sets up all buttons with an fg-copy-button attribute
    // to copy the corresponding value using the copyValue function above
    setCopyButtons() {
        this.element.find('[fg-copy-button]').each((i, v) => {
            let elem = $(v);
            let copyId = elem.attr('fg-copy-button');
            elem.click(() => this.copyValue(copyId));
        });
    }

    // Function that sets up socket message handler functions
    setSocketHandlers() {
        // When a sync message is received...
        io.on(`${name}:sync`, msg => {
            // Send a log to the console for debugging purposes
            console.log(`Received ${name}:sync, ${msg}`);

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
    }
}
