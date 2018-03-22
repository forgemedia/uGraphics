import $ from 'jquery';
import _ from 'lodash';
import Numeral from 'numeral';

let timers = {};
let elems = {};

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
    if (counter < 0) elems[id].addClass('timer-negative');
    else elems[id].removeClass('timer-negative');
    elems[id].text(format(counter));
    if (timers[id].lmode == 'hard' && counter == timers[id].limiter) clearInterval(timers[id].cinterval);
    if (counter == timers[id].limiter) elems[id].addClass('timer-overtime');
}

let start = id => {
    if (!timers[id] || timers[id].cinterval) return;
    console.debug(`- Timer start ${id}`);
    timers[id].cinterval = setInterval(() => {
        console.debug(`- Timer uptick ${id}, ${timers[id].counter++}`);
        update(id);
    }, 1000);
};

let down = id => {
    if (!timers[id] || timers[id].cinterval) return;
    console.debug(`- Timer down ${id}`);
    timers[id].cinterval = setInterval(() => {
        console.debug(`- Timer dntick ${id}, ${timers[id].counter--}`);
        update(id);
    }, 1000);
}

let set = data => {
    stop(data.id);
    elems[data.id].removeClass('timer-overtime timer-negative');
    timers[data.id] = {
        counter: data.counter || 0,
        direction: data.direction || 'up',
        cinterval: null,
        limiter: data.limiter || null,
        lmode: data.lmode || 'soft'
    }
    update(data.id);
};

let lset = data => {
    if (!timers[data.id]) set(data);
    if (data.limiter < 0) timers[data.id].limiter = null;
    timers[data.id].limiter = data.limiter || timers[data.id].limiter || null;
    timers[data.id].lmode = data.lmode || timers[data.id].lmode || 'soft';
};

let stop = id => {
    console.debug(`- Timer stop ${id}`);
    if (timers[id] && timers[id].cinterval) {
        clearInterval(timers[id].cinterval);
        timers[id].cinterval = null;
    }
}

let add = data => {
    if (!timers[data.id]) return;
    console.debug(`- Timer add ${data.id}, ${data.counter}`);
    timers[data.id].counter += parseInt(data.counter) || 0;
    update(data.id);
}

export default controller => {
    console.debug(`${controller.name}: timer module`);
    controller.cgTriggerSubscribe('timer', data => {
        elems[data.id] = controller.element.find(`[fg-timer='${data.id}']`);
        console.debug(`${controller.name}: timer trigger ${JSON.stringify(data)}`);
        switch (data.op) {
            case 'start': start(data.id); break; // Start op: go forward
            case 'set': set(data); break; // Set op: stop, reset & reconfigure a timer
            case 'stop': stop(data.id); break; // Stop op: pause a timer
            case 'down': down(data.id); break; // Down op: go backwards
            case 'add': add(data); break; // Add op: Add to the counter (or subtract with a negative)
            case 'lset': lset(data); break; // Lset op: Set the timer's limiter without a full set op
            default: break;
        }
    });
};
