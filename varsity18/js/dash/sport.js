import $ from 'jquery';
import Rivets from 'rivets';

import dashController from 'js/dash/dashController';
import Timer from 'js/dash/modules/timer';

/** @ignore */
export default class extends dashController {
    constructor() {
        super('sport');
        Timer(this);
    }
}

