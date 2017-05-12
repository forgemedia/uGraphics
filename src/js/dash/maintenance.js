import $ from 'jquery';
import Rivets from 'rivets';
import _ from 'lodash';

import DashController from './controller';

export default class extends DashController {
    constructor() {
        super('maintenance');
        _.assign(this.methods, {
            // Send a message triggering the reset of the character generator
            reset: () => this.io.emit('maintenance:trigger', { id: 'reset' })
        });
    }
}
