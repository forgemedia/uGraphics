import $ from 'jquery';
import Rivets from 'rivets';

import DashController from '../dashController';
import Timer from '../modules/timer';

/** @ignore */
export default class extends DashController {
    constructor() {
        super('sport');
        Timer(this);
    }
}

