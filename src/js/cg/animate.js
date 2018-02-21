import $ from 'jquery';
import Velocity from 'velocity';

// TODO: automate animation of child elements

// Acceptable fg-properties for animations and their default values
let propDescriptor = {
    opacity: 1,
    duration: 400,
    easing: 'swing',
    delay: 0
};

// Get properties from an element
let getProps = v => {
    let props = {};
    for (let prop in propDescriptor) {
        props[prop] = v.attr(`fg-${prop}`) || propDescriptor[prop];
        props[`${prop}-in`] = v.attr(`fg-${prop}-in`) || props[prop];
        props[`${prop}-out`] = v.attr(`fs-${prop}-out`) || props[out];
    }
    console.log(`animate: the pre-program props (classic) are ${JSON.stringify(props)}`);
    return props;
};

let getPropsInOut = (v, show) => {
    let props = {};
    for (let prop in propDescriptor)
        props[prop] = v.attr(`fg-${prop}`) || v.attr(`fg-${prop}-${show? 'in' : 'out'}`) || propDescriptor[prop];
    console.log(`animate: the pre-program props (inOut, show ${show}) are ${JSON.stringify(props)}`);
    return props;
};

// Fade an element
let fade = (v, show) => {
    console.log(`animate: fading (${show})`);
    let p = getPropsInOut(v, show);
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
    let animationProgram = '';
    let animInAttr = elem.attr('fg-anim-in');
    let animOutAttr = elem.attr('fg-anim-out');

    if (show && animInAttr) animationProgram = animInAttr;
    else if (!show && animOutAttr) animationProgram = animOutAttr;
    else animationProgram = elem.attr('fg-anim') || 'none';
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
