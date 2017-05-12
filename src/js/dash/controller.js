import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';
import _ from 'lodash';

let io;
let name;
let dataStoreBacking = {};
let methodsBacking = {};

export default class DashController {
    constructor(id) {
        this.element = $(`[fg-panel='${id}']`);
        name = id;
        io = SocketIOClient.connect();
        this.io = io;

        this.methods = new Proxy(methodsBacking, this.methodsStoreTraps);
        this.dataStore = new Proxy(dataStoreBacking, this.dataStoreTraps);
        this.view = Rivets.bind(this.element, this.dataStore);

        this.setSocketHandlers();
        $(() => {
            io.emit(`${name}:get`);
        });
    }
    get dataStoreTraps() {
        return {
            set: function(target, property, value, receiver) {
                target[property] = value;
                io.emit(`${name}:sync`, target);
                return true;
            }
        }
    }
    get methodsStoreTraps() {
        return {

        }
    }
    setMethods() {
        $('[fg-click]').each((i, v) => {
            let elem = $(v);
            let method = elem.attr('fg-click');
            elem.click(this.methods[method]);
        });
    }
    setSocketHandlers() {
        io.on(`${name}:sync`, msg => {
            _.assign(dataStoreBacking, msg)
        });
    }
}
