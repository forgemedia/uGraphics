import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';

let IO = SocketIOClient.connect();

let dataStore = {};

let bind = el => Rivets.bind($(el), dataStore);

$(() => {
    IO.emit('bug:get');
});

IO.on('bug:sync', msg => {
    console.log(`bug:sync: ${JSON.stringify(msg)}`);
    Object.assign(dataStore, msg);
    console.log(JSON.stringify(dataStore));
});

export { bind as Bind };
