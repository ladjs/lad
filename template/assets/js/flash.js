const _ = require('lodash');
const s = require('underscore.string');
const swal = require('sweetalert2');

(() => {
  if (_.isObject(window._messages) && !_.isEmpty(window._messages)) {
    const steps = [];

    _.each(window._messages, (messages, type) => {
      if (messages.length === 0) return;
      const html =
        messages.length === 1
          ? messages[0]
          : `<ul class="m-a-0 text-left"><li>${messages.join('</li><li>')}</li></ul>`;
      _.each(messages, message => {
        if (type === 'custom' && _.isObject(message)) steps.push(message);
        else
          steps.push({
            title:
              _.isObject(window._types) && !s.isBlank(window._types[type])
                ? window._types[type]
                : type,
            html,
            type: _.isObject(window._types) && !s.isBlank(window._types[type]) ? type : null
          });
      });
    });

    if (steps.length > 0) swal.queue(steps);
  }
})();
