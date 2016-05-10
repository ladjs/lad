
import swal from 'sweetalert';
import _ from 'lodash';

(() => {

  if (!_.isEmpty(window._messages))
    _.each(window._messages, (messages, type) => {
      if (messages.length === 0) return;
      swal({
        title: _.upperFirst(type),
        text: messages.join(', '),
        type: type,
        html: true
      });
    });

})();
