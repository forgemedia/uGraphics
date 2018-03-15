import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import cgController from 'js/cg/cgController';
import Timer from 'js/cg/modules/timer';

/** @ignore */
export default class extends cgController {
    constructor() {
        super('sport');
        Timer(this);
    }
}
