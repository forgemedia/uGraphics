import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import CGController from 'js/cg/cgcontroller';
import Clock from 'js/cg/modules/clock';

/** @ignore */
export default class extends CGController {
    constructor() {
        super('bug');
        Clock(this);
    }
}
