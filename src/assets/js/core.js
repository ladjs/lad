
const jQuery = window.jQuery = require('jquery');

window.Tether = require('tether');
require('bootstrap/dist/js/bootstrap');

const Clipboard = window.Clipboard = require('clipboard');

window.hljs = require('highlight.js');
window.hljs.initHighlightingOnLoad();

(($) => {


  $(() => {

    // handle hashes when page loads
    // <http://stackoverflow.com/a/29853395>
    function adjustAnchor() {
      const $anchor = $(':target');
      const fixedElementHeight = $('.navbar-fixed-top').outerHeight();
      if ($anchor.length > 0)
        window.scrollTo(0, $anchor.offset().top - fixedElementHeight);
    }
    $(window).on('hashchange load', adjustAnchor);
    $('body').on('click', "a[href^='#']", function (ev) {
      if (window.location.hash === $(this).attr('href')) {
        ev.preventDefault();
        adjustAnchor();
      }
    });


    // automatically show tooltips and popovers
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();


    // handle clipboard copy helper buttons
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
      if (/iPhone|iPad/i.test(navigator.userAgent))
        title = 'No clipboard support, sorry!';
      else if (/Mac/i.test(navigator.userAgent))
        title = `Press <kbd>⌘-${key}</kbd> to ${ev.action}`;
      $(ev.trigger)
        .tooltip({
          title,
          html: true,
          placement: 'bottom'
        })
        .tooltip('show');
      $(ev.trigger).on('hidden.bs.tooltip', () => {
        $(ev.trigger).tooltip('dispose');
      });
    });

  });

})(jQuery);
