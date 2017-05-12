import $ from 'jquery';
import Velocity from 'velocity';

// Called when something needs to be animated in or out
export default (element, show) => {
    // Get a jQuery object for the element
    let elem = $(element);

    // Hide or show it: no proper animations yet
    elem.toggle(show);
}
