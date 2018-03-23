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
            let direction = el.attr('fg-timer-direction'); if (direction) request.settings.direction = direction;
            let limiter = el.attr('fg-timer-limiter'); if (limiter) request.settings.limiter = limiter;
            let lmode = el.attr('fg-timer-lmode'); if (lmode) request.settings.lmode = lmode;
            controller.mechanism('timer', request);
        });
    });
};
