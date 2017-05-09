import $ from 'jquery';
import Rivets from 'rivets';

let dataStore = {
    message: 'test message'
}

let bind = el => Rivets.bind($(el), dataStore);

export { bind as Bind };
