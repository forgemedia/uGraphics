import $ from 'jquery';

export default controller => {
    console.log(`${controller.name}: queue module`);
    controller.element.find('[fg-queue-add]').each((i, v) => {
        let el = $(v);
        let ar = el.attr('fg-queue-add');

        el.click(() => {
            console.log(`${controller.name}: fg-queue-add for ${ar}`);
            controller.dataStore[`queue_${ar}`].push(controller.dataStore.currentQueueInput[ar]);
            controller.emitStore();
        });
    });
    controller.dataStore.triggerQueued = (ev, binding) => {
        console.log(`${controller.name}: triggerQueued`);
        let el = $(ev.target);
        let queueId = el.attr('fg-queue-trigger');
        let queue = controller.dataStore[`queue_${queueId}`];
        controller.trigger(queueId, queue[binding.index]);
    };
    controller.dataStore.delQueued = (ev, binding) => {
        console.log(`${controller.name}: delQueued`);
        let el = $(ev.target);
        let queueId = el.attr('fg-queue-remove');
        let queue = controller.dataStore[`queue_${queueId}`];
        queue.splice(binding.index, 1);
        controller.emitStore();
    };
};
