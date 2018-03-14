import $ from 'jquery';
import _ from 'lodash';

let counter = 0;
let countInterval;

export default controller => {
    console.log(`${controller.name}: timer module`);
    controller.cgTriggerSubscribe('timer', data => {
        console.log(`${controller.name}: timer trigger ${JSON.stringify(data)}`);
        switch (data.op) {
            case 'start':
            console.log('timer start');
            break;
            default: break;
        }
    });
};
