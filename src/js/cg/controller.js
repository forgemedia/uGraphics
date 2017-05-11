import $ from 'jquery';
import SocketIOClient from 'socket.io-client';
import Rivets from 'rivets';

class CGController {
    constructor (selector, id) {
        this.element = $(selector);
        this.dataStore = {};
        this.name = id;
        this.io = SocketIOClient.connect();

        Rivets.bind(this.element, this.dataStore);
        $(() => IO.emit(`${this.name}:get`));
        
        this.io.on(`${this.name}:sync`, msg => {
            Object.assign(this.dataStore, msg);
            this.syncSocket(msg);
        });
    }
    syncSocket(msg) {

    }
}
