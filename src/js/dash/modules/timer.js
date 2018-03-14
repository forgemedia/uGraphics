import $ from 'jquery';

export default controller => {
    console.log(`${controller.name}: timer module`);
    controller.element.find('[fg-timer-id]').each((i, v) => {
        let el = $(v);
        let id = el.attr('fg-timer-id');
        let op = el.attr('fg-timer-op');
        if (!op) return;
        
        el.click(() => {
            controller.trigger(`timer`, {
                op: op
            });
        });
    });
};
