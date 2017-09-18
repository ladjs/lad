const _ = require('lodash');
const swal = require('./swal');

(() => {
  if (!_.isEmpty(window._messages)) {
    const steps = [];

    _.each(window._messages, (messages, type) => {
      if (messages.length === 0) return;
      const html =
        messages.length === 1
          ? messages[0]
          : `<ul class="m-a-0 text-left"><li>${messages.join(
              '</li><li>'
            )}</li></ul>`;
      steps.push({
        title: window._types[type],
        html,
        type
      });
    });

    if (steps.length > 0) swal.queue(steps);
  }
})();
