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
        console.log(`${id}: constructing controller`);

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

                let obj = {};
                obj[property] = value;

                // Emit a socket message informing the server of changes
                // and in turn causing it to sync other clients
                io.emit(`${name}:sync`, obj);

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
        console.log(`${name}: copying value ${id}`);

        // Does what it says on the tin
        this.dataStore[id] = $(`[fg-copy='${id}']`).val();
    }

    // Function that sets up all buttons with an fg-copy-button attribute
    // to copy the corresponding value using the copyValue function above
    setCopyButtons() {
        console.log(`${name}: setting copy buttons`);

        // For singular copy buttons
        this.element.find('[fg-copy-button]').each((i, v) => {
            // Find the element and get the name of the field it'll copy
            let elem = $(v);
            let copyId = elem.attr('fg-copy-button');

            console.log(`${name}: found fg-copy-button for copyId ${copyId}`);
            elem.click(() => {
                console.log(`${name}: fg-copy-button clicked for copyId ${copyId}`);
                
                // On click, copy the field
                this.copyValue(copyId);
            });
        });

        this.element.find('[fg-copy-button-group]').each((i, v) => {
            // Find the element and get the name of the group it copies
            let elem = $(v);
            let copyGroup = elem.attr('fg-copy-button-group');

            console.log(`${name}: found fg-copy-button for copyGroup ${copyGroup}`);
            elem.click(() => {
                // On click
                console.log(`${name}: fg-copy-button-group clicked for copyGroup ${copyGroup}`);

                // Find all inputs that share that group
                this.element.find(`[fg-copy-group="${copyGroup}"]`).each((ia, va) => {
                    // Find the element and get the name of the copy field it's bound to
                    let elem_a = $(va);
                    let copyId = elem_a.attr('fg-copy');

                    console.log(`${name}: find fg-copy-group= copyGroup ${copyGroup}, copyId ${copyId}`)
                    // Copy the field
                    this.copyValue(copyId);
                });
            });
        });

        this.element.find('[fg-trigger-button-group]').each((i, v) => {
            // Find the element and get the name of the trigger group it beliongs to
            let elem = $(v);
            let triggerGroup = elem.attr('fg-trigger-button-group');

            console.log(`${name}: found fg-trigger-button for triggerGroup ${triggerGroup}`);
            elem.click(() => {
                let data = {};
                console.log(`${name}: fg-trigger-button-group clicked for triggerGroup ${triggerGroup}`);

                this.element.find(`[fg-trigger-group="${triggerGroup}"]`).each((ia, va) => {
                    let elem_a = $(va);
                    let triggerId = elem_a.attr('fg-trigger');

                    console.log(`${name}: find fg-trigger-group triggerGroup ${triggerGroup}, triggerId ${triggerId}`);
                    data[triggerId] = $(`[fg-trigger='${triggerId}']`).val();
                });

                this.trigger(triggerGroup, data);
            });
        });
    }

    // Send a trigger message with id, data
    trigger(id, data) {
        console.log(`${name}: trigger id ${id}, data ${JSON.stringify(data)}`)
        this.io.emit(`${name}:trigger`, _.assign({ id: id, data: data || null}));
    }

    // Function that sets up socket message handler functions
    setSocketHandlers() {
        // When a sync message is received...
        io.on(`${name}:sync`, msg => {
            console.log(`${name}: received sync, ${JSON.stringify(msg)}`);

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
