import $ from 'jquery';
import Rivets from 'rivets';
import { IO } from '../dash';

let dataStore = {
    showBug: false
};

let proxy = new Proxy(dataStore, {
    set: function(target, property, value, receiver) {
        target[property] = value;
        IO.emit('bug:sync', target);
    }
});

let bind = el => Rivets.bind($(el), proxy);

export { bind as Bind };
