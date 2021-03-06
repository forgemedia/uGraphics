import $ from 'jquery';
import Velocity from 'velocity';

// TODO: automate animation of child elements

/** Acceptable fg-properties for animations and their default values */
let propDescriptor = {
    opacity: 1,
    'out-opacity': 0,
    duration: 400,
    easing: 'swing',
    translateX: '200px',
    translateY: '200px',
    easing: 'Cubic',
    delay: 0
};

/**
 * Get properties from an element 
 * @param {element} v The element to get properties from 
 */
let getProps = v => {
    let props = {};
    for (let prop in propDescriptor) {
        props[prop] = v.attr(`fg-${prop}`) || propDescriptor[prop];
        props[`${prop}-in`] = v.attr(`fg-${prop}-in`) || props[prop];
        props[`${prop}-out`] = v.attr(`fs-${prop}-out`) || props[out];
    }
    console.debug(`animate: the pre-program props (classic) are ${JSON.stringify(props)}`);
    return props;
};

/**
 * Gets animation properties for an element, given the element and whether it's animating in or out
 * @param {element} v The element
 * @param {boolean} show The element will show (if false, will hide)
 */
let getPropsInOut = (v, show) => {
    let props = {};
    for (let prop in propDescriptor)
        props[prop] = v.attr(`fg-${prop}`) || v.attr(`fg-${prop}-${show? 'in' : 'out'}`) || propDescriptor[prop];
    props.easing = `ease${show? 'Out' : 'In'}${props.easing}`;
    console.debug(`animate: the pre-program props (inOut, show ${show}) are ${JSON.stringify(props)}`);
    return props;
};

// TODO: rename animation program functions so that they have a clear naming pattern

/** Animation program: fade */
let apr_fade = (v, show) => {
    console.debug(`animate: fading (${show})`);
    let p = getPropsInOut(v, show);
    v.velocity({
        opacity: show? p.opacity : 0
    }, {
        easing: 'linear',
        duration: p.duration,
        delay: p.delay
    });
};

/**
 * Animation program: slide x
 */
let apr_slide_x = (v, show) => {
    console.debug(`animate: sliding x (${show})`);
    let p = getPropsInOut(v, show);
    v.velocity({
        opacity: show? p.opacity : p['out-opacity'],
        transform: show? [ 'translateX(0px)', `translateX(${p.translateX})` ] : [ `translateX(${p.translateX})`, 'translateX(0px)' ]
    }, {
        easing: p.easing,
        duration: p.duration,
        delay: p.delay
    });
};

/** Animation program: slide y */
let apr_slide_y = (v, show) => {
    console.debug(`animate: sliding y (${show})`);
    let p = getPropsInOut(v, show);
    v.velocity({
        opacity: show? p.opacity : p['out-opacity'],
        transform: show? [ 'translateY(0px)', `translateY(${p.translateY})` ] : [ `translateY(${p.translateY})`, 'translateY(0px)' ]
    }, {
        easing: p.easing,
        duration: p.duration,
        delay: p.delay
    });
};

/**
 * Animate an element according to its properties
 * @param {element} element The element
 * @param {boolean} show The element will show (if false, will hide)
 */
export default (element, show) => {
    // Get a jQuery object for the element
    let elem = $(element);
    console.debug(`animate: ANIMATING ${elem.prop('id')} (${show})`);

    // Get the fg-anim animation program for each element, or 'none' if there is
    // no fg-anim attribute
    let animationProgram = '';
    let animInAttr = elem.attr('fg-anim-in');
    let animOutAttr = elem.attr('fg-anim-out');

    if (show && animInAttr) animationProgram = animInAttr;
    else if (!show && animOutAttr) animationProgram = animOutAttr;
    else animationProgram = elem.attr('fg-anim') || 'none';
    console.debug(`animate: the animation program is ${animationProgram}`);

    // Make sure the element is actually visible
    elem.show();

    // A switch for the animation program
    switch (animationProgram) {
        case 'fade':
            apr_fade(elem, show);
            break;
        case 'slide-x':
            apr_slide_x(elem, show);
            break;
        case 'slide-y':
            apr_slide_y(elem, show);
            break;
        case 'none':
        default:
            elem.toggle(show);
            break;
    }
}
