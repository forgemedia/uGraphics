import $ from 'jquery';

export default controller => {
    console.debug(`${controller.name}: timer module`);
    controller.element.find('[fg-timer-id]').each((i, v) => {
        let el = $(v);
        let id = el.attr('fg-timer-id');
        let op = el.attr('fg-timer-op');
        let counter = el.attr('fg-timer-counter');
        if (!op) return;
        
        el.click(() => {
            controller.trigger(`timer`, {
                op: op,
                id: id,
                counter: el.attr('fg-timer-counter') || 0,
                limiter: el.attr('fg-timer-limiter') || -1,
                lmode: el.attr('fg-timer-lmode') || 'soft'
            });
        });
    });
    controller.replySubscribe('timer', data => {
        console.log(`Timer reply: ${JSON.stringify(data)}`);
    })
};
