import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';
import fgAnimate from './animate.js';

let dataStoreBacking = {};

export default class CGController {
    constructor (id) {
        this.element = $(`[fg-component='${id}']`);
        this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);
        this.methods = {};
        this.name = id;
        this.io = SocketIOClient.connect();

        Rivets.bind(this.element, this.dataStore);
        
        this.setSocketHandlers();
        $(() => this.io.emit(`${this.name}:get`));
    }
    setSocketHandlers() {
        this.io.on(`${this.name}:sync`, msg => {
            console.log(`Received ${this.name}:sync, ${msg}`);
            _.assign(this.dataStore, msg);
            this.syncSocket(msg);
        });
        this.io.on(`${this.name}:trigger`, msg => {
            console.log(`Received ${this.name}: trigger, ${msg}`);
            let id = msg.id;
            if (this.methods[id]) this.methods[id](msg.data);
        });
    }
    get dataStoreTraps() {
        return {
            set: function (target, property, value, receiver) {
                target[property] = value;
                $(`[fg-show='${property}`).each((i, v) => fgAnimate(v, value));
            }
        }
    }
    syncSocket(msg) {}
}
