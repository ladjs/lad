
import qs from 'querystring';
import swal from 'sweetalert2';

const jQuery = window.jQuery = require('jquery');

window.Tether = require('tether');
require('bootstrap/dist/js/bootstrap');

const Clipboard = window.Clipboard = require('clipboard');

window.hljs = require('highlight.js');
window.hljs.initHighlightingOnLoad();

// add optional support for older browsers
import es6promise from 'es6-promise';
es6promise.polyfill();

// add required support for global `fetch` method
// *this must always come before `frisbee` is imported*
import 'isomorphic-fetch';

// require the module
import Frisbee from 'frisbee';

// create a new instance of Frisbee
const api = new Frisbee({
  baseURI: window.location.origin,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-CSRF-Token': window._csrf
  }
});

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


    // ajax form submission with frisbee
    // and sweetalert2 message response
    $('body').on('submit', '.ajax-form', async function (ev) {

      ev.preventDefault();

      const $form = $(this);
      const action = $form.attr('action');
      let method = $form.attr('method').toLowerCase();

      // take into account method override middleware
      if (method === 'POST' && $form.find('input[name="_method"]').length)
        method = $form.find('input[name="_method"]').val().toLowerCase();

      try {
        const res = await api[method](action, {
          body: qs.parse($form.serialize()),
          credentials: 'same-origin'
        });
        console.log('res', res);
        console.log('res.headers', res.headers);
        if (res.err) throw res.err;
      } catch (err) {
        swal('Oops!', err.message, 'error');
      }

    });

  });

})(jQuery);
