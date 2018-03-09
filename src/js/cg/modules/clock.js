import $ from 'jquery';
import _ from 'lodash';
import Moment from 'moment';

export default () => {
    // Tick every second
    let tickFn = () => {
        $('[fg-clock').each((i, v) => { 
            let el = $(v);
            el.text(() => Moment().format(el.attr('fg-clock-format') || 'HH:MM'));
        });
    };
    tickFn();
    return setInterval(tickFn, 1000);
};
