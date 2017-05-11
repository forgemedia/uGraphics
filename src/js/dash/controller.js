import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';

let io;
let name;

export default class DashController {
    constructor(id) {
        this.element = $(`[fg-panel='${id}']`);
        name = id;
        this.dataStore = {};
        io = SocketIOClient.connect();
        this.proxy = new Proxy(this.dataStore, this.handler);

        this.view = Rivets.bind(this.element, this.proxy);

        this.setSocketHandlers();
        $(() => io.emit(`${name}:get`));
        proxy.showBug = true;
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
            Object.assign(this.dataStore, msg)
        });
    }
}
