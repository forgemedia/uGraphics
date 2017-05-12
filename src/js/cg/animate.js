import $ from 'jquery';
import Velocity from 'velocity';

export default (element, show) => {
    let elem = $(element);
    elem.toggle(show);
}
