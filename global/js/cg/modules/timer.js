import $ from 'jquery';
import _ from 'lodash';

let timers = {};

let update = id => {
    $(`[fg-timer='${id}']`).text(timers[id].counter);
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
    timers[data.id] = {
        counter: data.counter || 0,
        direction: data.direction || 'up',
        cinterval: null
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
