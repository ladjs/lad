const $ = require('jquery');
const Clipboard = require('clipboard');

module.exports = () => {
  // Handle clipboard copy helper buttons
  if (Clipboard.isSupported()) {
    const clipboard = new Clipboard('[data-toggle="clipboard"]');
    clipboard.on('success', ev => {
      ev.clearSelection();
      $(ev.trigger)
        .tooltip({
          title: 'Copied!',
          placement: 'bottom'
        })
        .tooltip('show');
      $(ev.trigger).on('hidden.bs.tooltip', () => {
        $(ev.trigger).tooltip('dispose');
      });
    });
    clipboard.on('error', ev => {
      const key = ev.action === 'cut' ? 'X' : 'C';
      let title = `Press <kbd>CTRL-${key}</kbd> to ${ev.action}`;

      if (/iPhone|iPad/i.test(navigator.userAgent)) {
        title = 'No clipboard support, sorry!';
      } else if (/Mac/i.test(navigator.userAgent)) {
        title = `Press <kbd>⌘-${key}</kbd> to ${ev.action}`;
      }

      $(ev.trigger)
        .tooltip({
          title,
          html: true,
          placement: 'bottom'
        })
        .tooltip('show');
      $(ev.trigger).on('hidden.bs.tooltip', () => $(ev.trigger).tooltip('dispose'));
    });
  } else {
    $('[data-toggle-clipboard]').addClass('hidden');
  }
};
