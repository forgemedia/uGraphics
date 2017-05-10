import $ from 'jquery';
import Rivets from 'rivets';
import { IO } from '../dash';

let dataStore = {
    showBug: false
}

let bind = el => Rivets.bind($(el), dataStore);

export { bind as Bind };
