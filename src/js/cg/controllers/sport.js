import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import CGController from '../cgController';
import Timer from '../modules/timer';

/** @ignore */
export default class extends CGController {
    constructor() {
        super('sport');
        Timer(this);
    }
}
