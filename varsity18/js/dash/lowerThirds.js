import $ from 'jquery';
import Rivets from 'rivets';

import dashController from 'js/dash/dashController';
import Queue from 'js/dash/modules/queue';

/** @ignore */
export default class extends dashController {
    constructor() {
        super('lowerThirds');
        Queue(this);
    }
}
