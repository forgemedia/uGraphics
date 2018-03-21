import $ from 'jquery';
import Rivets from 'rivets';

import dashController from 'js/dash/dashController';
import Timer from 'js/dash/modules/timer';

/** @ignore */
export default class extends dashController {
    constructor() {
        super('sport');
        Timer(this);
        this.dataStore.methods.timerOpBoth = (ev, binding) => {
            let op = $(ev.target).attr('fg-timer-op');
            $(`[fg-timer-id='timer1'][fg-timer-op='${op}']`).click();
            $(`[fg-timer-id='timer2'][fg-timer-op='${op}']`).click();
        }
    }
}

