import $ from 'jquery';
import Rivets from 'rivets';

import DashController from '../dashController';
import Queue from '../modules/queue';

/** @ignore */
export default class extends DashController {
    constructor() {
        super('lowerThirds');
        Queue(this);
    }
}
