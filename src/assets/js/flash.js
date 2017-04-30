
import swal from 'sweetalert2';
import _ from 'lodash';

(() => {

  if (!_.isEmpty(window._messages)) {

    const steps = [];

    _.each(window._messages, (messages, type) => {
      if (messages.length === 0) return;
      steps.push({
        title: window._types[type],
        html: messages.length === 1 ?
          messages[0]
          : `<ul class="m-a-0 text-left"><li>${messages.join('</li><li>')}</li></ul>`,
        type: type
      });
    });

    if (steps.length > 0)
      swal.queue(steps).then();

  }

})();
