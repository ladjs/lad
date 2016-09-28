
import _ from 'lodash';
import qs from 'querystring';
import swal from 'sweetalert2';
import Spinner from './spinner';

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

// google web fonts
import WebFont from 'webfontloader';

WebFont.load({
  google: {
    families: [
      'Inconsolata',
      // 'Open+Sans:400,700'
      'Lato:400,700',
      'Roboto:400,700'
    ]
  }
});

// import waypoints
require('waypoints/lib/jquery.waypoints.js');
//
// usage example:
//
/*
// detect when we scroll past the logo, then fade in
// the navbar-logo so it shows up smoothly
// note that `#element-to-show-on-scroll` must have
// a class of `fade` added to it, so when we apply
// `in` and remove `in`, it gets faded in and out
if ($('#some-selector').length) {
  const waypoint = new window.Waypoint({
    element: $('#some-selector').get(0),
    handler: direction => {
      if (direction === 'up')
        $('#element-to-show-on-scroll').removeClass('in');
      else if (direction === 'down')
        $('#element-to-show-on-scroll').addClass('in');
    },
    offset: $('#some-selector').height() * -1
  });
  // when the page loads we need to make sure its checked
  waypoint.context.refresh();
}
*/

// import pointer events polyfill for ie
require('jquery.pointer-events-polyfill/dist/jquery.pointer-events-polyfill.min.js');

// import jquery lazy
require('jquery-lazy');

// import dense for images
require('dense/src/dense.js');

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

  // add pointer events polyfill
  window.pointerEventsPolyfill();

  // initialize spinner with jQuery
  const spinner = new Spinner($);

  $(() => {

    // lazy load images using jquery.lazy
    $('img.lazy').Lazy({ retinaAttribute: 'data-2x' });

    // dense for all other non lazy images
    $('img:not(".lazy")').dense();

    // handle hashes when page loads
    // <http://stackoverflow.com/a/29853395>
    function adjustAnchor(ev) {
      const $anchor = $(':target');
      const fixedElementHeight = $('.navbar-fixed-top').outerHeight();
      if ($anchor.length > 0)
        window.scrollTo(0, $anchor.offset().top - fixedElementHeight - 20);
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

      // prevent default form submission
      ev.preventDefault();

      // show the spinner
      spinner.show();

      // get the form
      const $form = $(this);

      // disable submit button so we can't resubmit the form
      const $btns = $form.find('input[type="submit"], button[type="submit"]');
      $btns.prop('disabled', true).addClass('disabled');

      // determine the path we're sending the request to
      const action = $form.attr('action');

      // determine the method of the HTTP request
      let method = $form.attr('method');

      // default to GET request
      if (!method) method = 'GET';

      // take into account method override middleware
      if (method === 'POST' && $form.find('input[name="_method"]').length)
        method = $form.find('input[name="_method"]').val();

      try {

        // send the request
        const res = await api[method.toLowerCase()](action, {
          body: qs.parse($form.serialize()),
          credentials: 'same-origin'
        });

        // check if any errors occurred
        if (res.err) throw res.err;

        // either display a success message, redirect user, or reload page
        if (!_.isObject(res.body)) {
          // hide the spinner
          spinner.hide();
          // show message
          swal('Success', res.body.toString(), 'success');
        } else if (_.isString(res.body.redirectTo)) {
          if (!_.isString(res.body.message)
            || (_.isBoolean(res.body.autoRedirect) && res.body.autoRedirect)) {
            // redirect
            window.location = res.body.redirectTo;
          } else {
            // hide the spinner
            spinner.hide();
            // show message
            await swal('Success', res.body.message, 'success');
            // redirect
            window.location(res.body.redirectTo);
          }
        } else if (_.isBoolean(res.body.reloadPage) && res.body.reloadPage) {
          // hide the spinner
          spinner.hide();
          // show message
          await swal('Success', res.body.message, 'success');
          // reload page
          window.location.reload();
        } else if (_.isString(res.body.message)) {
          // hide the spinner
          spinner.hide();
          // show message
          swal('Success', res.body.message, 'success');
        } else {
          // hide the spinner
          spinner.hide();
          // show message
          swal('Success', JSON.stringify(res.body, null, 2), 'success');
        }

        // reset the form
        $form.get(0).reset();

      } catch (err) {

        // hide the spinner
        spinner.hide();

        // show error message
        swal('Oops!', err.message, 'error');

      } finally {

        // re-enable form buttons
        $btns.prop('disabled', false).removeClass('disabled');

      }

    });

  });

})(jQuery);
