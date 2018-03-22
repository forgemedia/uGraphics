import $ from 'jquery';

export default controller => {
    console.debug(`${controller.name}: timer module`);
    controller.element.find('[fg-timer-id]').each((i, v) => {
        let el = $(v);

        el.click(() => {
            let id = el.attr('fg-timer-id');
            let op = el.attr('fg-timer-op');
            if (!id || !op) return;

            let request = {
                op: op,
                id: id,
                settings: {}
            };

            let counter = el.attr('fg-timer-counter'); if (counter) request.settings.counter = counter;
            controller.mechanism('timer', request);
        });
    });
};
