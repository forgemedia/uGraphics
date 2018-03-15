import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import cgController from 'js/cg/cgController';
import Clock from 'js/cg/modules/clock';

/** @ignore */
export default class extends cgController {
    constructor() {
        super('bug');
        Clock(this);
    }
}
