import $ from 'jquery';
import _ from 'lodash';
import Moment from 'moment';

/** Sets up and returns an interval that updates the text of all elements
 * with an fg-clock attribute to the current time, every second
 * @return {Number} The ID of the timer that was set
 */
export default controller => {
    // Tick every second
    let tickFn = () => {
        controller.element.find('[fg-clock]').each((i, v) => { 
            let el = $(v);
            el.text(Moment().format(el.attr('fg-clock-format') || 'HH:MM'));
        });
    };
    tickFn();
    return setInterval(tickFn, 1000);
};
