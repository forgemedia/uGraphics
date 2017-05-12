import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';
import _ from 'lodash';

let io;
let name;
let dataStore = {};

export default class DashController {
    constructor(id) {
        this.element = $(`[fg-panel='${id}']`);
        name = id;
        io = SocketIOClient.connect();
        this.io = io;

        this.proxy = new Proxy(dataStore, this.handler);
        this.view = Rivets.bind(this.element, this.proxy);

        this.setSocketHandlers();
        $(() => io.emit(`${name}:get`));
    }
    get handler() {
        return {
            set: function(target, property, value, receiver) {
                target[property] = value;
                io.emit(`${name}:sync`, target);
                return true;
            }
        }
    }
    setSocketHandlers() {
        io.on(`${name}:sync`, msg => {
            _.assign(dataStore, msg)
        });
    }
}
