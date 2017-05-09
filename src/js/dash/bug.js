import $ from 'jquery';
import Rivets from 'rivets';

let dataStore = {
    showBug: false
}

let bind = el => Rivets.bind($(el), dataStore);

export { bind as Bind };
