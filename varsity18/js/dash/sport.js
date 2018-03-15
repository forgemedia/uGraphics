import $ from 'jquery';
import Rivets from 'rivets';

import DashController from 'js/dash/dashController';
import Timer from 'js/dash/modules/timer';

/** @ignore */
export default class extends DashController {
    constructor() {
        super('sport');
        Timer(this);
    }
}

