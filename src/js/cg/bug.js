import $ from 'jquery';
import Rivets from 'rivets';
import { IO } from '../cg';

let dataStore = {
    showBug: false
};

let bind = el => Rivets.bind($(el), dataStore);

$(() => $('body').show());

IO.on('bug:sync', msg => dataStore = msg);

export { bind as Bind };
