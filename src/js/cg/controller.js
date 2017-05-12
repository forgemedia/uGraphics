import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';

export default class CGController {
    constructor (id) {
        this.element = $(`[fg-component='${id}']`);
        this.dataStore = {};
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
    syncSocket(msg) {}
}
