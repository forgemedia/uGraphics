import $ from 'jquery';
import Rivets from 'rivets';
import SocketIOClient from 'socket.io-client';

import CGController from './controller';

export default class extends CGController {
    constructor() {
        super('bug');
    }
}
