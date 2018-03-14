import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import CGController from '../cgController';
import Clock from '../modules/clock';

/** @ignore */
export default class extends CGController {
    constructor() {
        super('bug');
        Clock(this);
    }
}
