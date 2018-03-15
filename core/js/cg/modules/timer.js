import $ from 'jquery';
import _ from 'lodash';
import Numeral from 'numeral';

let timers = {};

let padNum = (num, len) => {
    return num.toString().padStart(len, '0');
}

let format = seconds => {
    if (seconds < 0) seconds *= -1;
    let minutes = Math.floor(seconds/60);
    seconds %= 60;
    return `${padNum(minutes, 2)}:${padNum(seconds, 2)}`;
}

let update = id => {
    let counter = timers[id].counter;
    if (counter == timers[id].limiter) clearInterval(timers[id].cinterval);
    let elems = $(`[fg-timer='${id}']`);
    if (counter < 0) elems.addClass('timer-negative');
    else elems.removeClass('timer-negative');
    elems.text(format(counter));
}

let start = id => {
    if (!timers[id] || timers[id].cinterval) return;
    console.log(`- Timer start ${id}`);
    timers[id].cinterval = setInterval(() => {
        console.log(`- Timer ctick ${id}, ${timers[id].counter++}`);
        update(id);
    }, 1000);
};

let down = id => {
    if (!timers[id] || timers[id].cinterval) return;
    console.log(`- Timer down ${id}`);
    timers[id].cinterval = setInterval(() => {
        console.log(`- Timer dtick ${id}, ${timers[id].counter--}`);
        update(id);
    }, 1000);
}

let set = data => {
    stop(data.id)
    timers[data.id] = {
        counter: data.counter || 0,
        direction: data.direction || 'up',
        cinterval: null,
        limiter: data.limiter || null
    }
    update(data.id);
};

let stop = id => {
    console.log(`- Timer stop ${id}`);
    if (timers[id] && timers[id].cinterval) {
        clearInterval(timers[id].cinterval);
        timers[id].cinterval = null;
    }
}

let add = data => {
    if (!timers[data.id]) return;
    console.log(`- Timer add ${data.id}, ${data.counter}`);
    timers[data.id].counter += parseInt(data.counter) || 0;
    update(data.id);
}

export default controller => {
    console.log(`${controller.name}: timer module`);
    controller.cgTriggerSubscribe('timer', data => {
        console.log(`${controller.name}: timer trigger ${JSON.stringify(data)}`);
        switch (data.op) {
            case 'start': start(data.id); break;
            case 'set': set(data); break;
            case 'stop': stop(data.id); break;
            case 'down': down(data.id); break;
            case 'add': add(data); break;
            default: break;
        }
    });
};
