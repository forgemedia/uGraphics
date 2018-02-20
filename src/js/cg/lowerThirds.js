import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';
import fgAnimate from './animate.js';

import CGController from './controller';

export default class extends CGController {
    constructor() {
        super('lowerThirds');
        _.assign(this.methods, {
            lt1: data => {
                this.cgTriggerAnimate(
                    'lt1',
                    $('#lt1'),
                    data,
                    7500
                );
            }
        });
    }
}
