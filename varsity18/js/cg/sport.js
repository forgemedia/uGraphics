import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import CGController from 'js/cg/cgcontroller';
import Timer from 'js/cg/modules/timer';

/** @ignore */
export default class extends CGController {
    constructor() {
        super('sport');
        Timer(this);
    }
}
