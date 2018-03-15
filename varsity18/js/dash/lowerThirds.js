import $ from 'jquery';
import Rivets from 'rivets';

import DashController from 'js/dash/dashController';
import Queue from 'js/dash/modules/queue';

/** @ignore */
export default class extends DashController {
    constructor() {
        super('lowerThirds');
        Queue(this);
    }
}
