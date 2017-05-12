import $ from 'jquery';

export default (el, value) => {
    if (!value) $(el).addClass('fg-hide');
    else $(el).removeClass('fg-hide');
}
