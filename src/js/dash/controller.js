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
        this.setFunctions();
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
            set: function(target, property, value, receiver) {
                if (typeof value !== 'function') return false;
                target[property] = value;
                $(`[fg-click='${property}']`).click(target[property]);
                return true;
            }
        }
    }
    copyValue(id) {
        this.dataStore[id] = $(`[fg-copy='${id}']`).val();
    }
    setFunctions() {
        this.element.find('[fg-copy-button]').each((i, v) => {
            let elem = $(v);
            let copyId = elem.attr('fg-copy-button');
            elem.click(() => this.copyValue(copyId));
        });
    }
    setSocketHandlers() {
        io.on(`${name}:sync`, msg => {
            _.assign(dataStoreBacking, msg);
            $(`[fg-copy]`).each((i, v) => {
                let elem = $(v);
                let model = elem.attr('fg-copy');
                elem.val(this.dataStore[model]);
            });
        });
    }
}
