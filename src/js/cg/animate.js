import $ from 'jquery';
import Velocity from 'velocity';

// Todo: separate in and out programs

// Acceptable fg-properties for animations and their default values
let propDescriptor = {
    opacity: 1,
    duration: 400,
    easing: 'swing',
    delay: 0,
    'delay-in': 0,
    'delay-out': 0
};

// Get properties from an element
let getProps = v => {
    let props = {};
    for (let prop in propDescriptor)
        props[prop] = v.attr(`fg-${prop}`) || propDescriptor[prop];
    props['delay-in'] = props['delay-in'] > 0? props['delay-in'] : props.delay;
    props['delay-out'] = props['delay-out'] > 0? props['delay-out'] : props.delay;
    console.log(`animate: the pre-program props are ${JSON.stringify(props)}`);
    return props;
};

// Fade an element
let fade = (v, show) => {
    console.log(`animate: fading (${show})`);
    let p = getProps(v);
    v.velocity({
        opacity: show? p.opacity : 0
    }, {
        easing: 'linear',
        duration: p.duration,
        delay: show? p['delay-in'] : p['delay-out']
    });
};

// Called when something needs to be animated in or out
export default (element, show) => {
    console.log(`animate: ${element} (${show})`);
    // Get a jQuery object for the element
    let elem = $(element);

    // Get the fg-anim animation program for each element, or 'none' if there is
    // no fg-anim attribute
    let animationProgram = elem.attr('fg-anim') || 'fade';
    console.log(`animate: the animation program is ${animationProgram}`);

    // Make sure the element is actually visible
    elem.show();

    // A switch for the animation program
    switch (animationProgram) {
        case 'fade':
            fade(elem, show);
            break;
        case 'none':
        default:
            elem.toggle(show);
            break;
    }
}
