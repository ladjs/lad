
import swal from 'sweetalert2';
import _ from 'lodash';

(() => {

  // initialize sweetalert manually
  // <https://github.com/limonte/sweetalert2/issues/287>
  swal.init();

  if (!_.isEmpty(window._messages)) {

    const steps = [];

    _.each(window._messages, (messages, type) => {
      if (messages.length === 0) return;
      steps.push({
        title: window._types[type],
        html: `<ul><li>${messages.join('</li><li>')}</li></ul>`,
        type: type
      });
    });

    if (steps.length > 0)
      swal.queue(steps).then();

  }

})();
