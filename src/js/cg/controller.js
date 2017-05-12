import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';
import _ from 'lodash';

export default class CGController {
    constructor (id) {
        this.element = $(`[fg-component='${id}']`);
        this.dataStore = {};
        this.name = id;
        this.io = SocketIOClient.connect();

        Rivets.bind(this.element, this.dataStore);
        
        this.setSocketHandlers();
        $(() => this.io.emit(`${this.name}:get`));
    }
    setSocketHandlers() {
        this.io.on(`${this.name}:sync`, msg => {
            _.assign(this.dataStore, msg);
            this.syncSocket(msg);
        });
    }
    syncSocket(msg) {}
}
