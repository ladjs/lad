
import url from 'url';
import s from 'underscore.string';
import _ from 'lodash';
import qs from 'querystring';
import swal from 'sweetalert2';
import Spinner from './spinner';

const jQuery = window.jQuery = require('jquery');

window.Tether = require('tether');
require('bootstrap/dist/js/bootstrap');

const Clipboard = window.Clipboard = require('clipboard');

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
      'Source+Code+Pro',
      'Roboto:300,400',
      'Montserrat'
    ]
  }
});

// import waypoints
require('waypoints/lib/jquery.waypoints.js');

// import pointer events polyfill for ie
require('jquery.pointer-events-polyfill/dist/jquery.pointer-events-polyfill.min.js');

// import jquery lazy
require('jquery-lazy');

// import dense for images
require('dense/src/dense.js');

// import jquery-placeholder for IE placeholder support
require('jquery-placeholder');

// create a new instance of Frisbee
const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'X-CSRF-Token': window._csrf
};
const api = new Frisbee({
  baseURI: window.location.origin,
  headers: defaultHeaders
});


// Remove the ugly Facebook appended hash
// <https://github.com/jaredhanson/passport-facebook/issues/12>
(function removeFacebookAppendedHash() {
  if (window.location.hash !== '' && window.location.hash !== '#_=_')
    return;
  if (window.history && window.history.replaceState)
    return window.history.replaceState(
      '',
      document.title,
      window.location.pathname + window.location.search
    );
  // Prevent scrolling by storing the page's current scroll offset
  const scroll = {
    top: document.body.scrollTop,
    left: document.body.scrollLeft
  };
  window.location.hash = '';
  // Restore the scroll offset, should be flicker free
  document.body.scrollTop = scroll.top;
  document.body.scrollLeft = scroll.left;
}());


//
// Since we support links containing `?return_to=/some/path`
//
// (e.g. if a user needs to log in to see content visible
// that is shown further down the page, we don't want to
// make them scroll down again, so we scroll down automatically
// after they have successfully logged in)
//
// we could do ?return_to=/some/path#some-anchor
// however this doesn't work due to server not receiving hash
// <http://stackoverflow.com/questions/317760/how-to-get-url-hash-from-server-side>
//
// they can't pick-up the hash tag server-side, so we pass it
// as a querystring parameter, therefore if there is a qs
// parameter of `hash=` then we must convert it to location
//
// For more information see function `signupOrLogin` in the auth controller
//
// <https://nodejs.org/api/url.html#url_url_format_urlobject>
//
(function supportHashLinkQuerystring() {
  const obj = url.parse(window.location.href, { parseQueryString: true });
  if (!_.isObject(obj.query) || !_.isString(obj.query.hash) || s.isBlank(obj.query.hash))
    return;
  obj.hash = obj.query.hash;
  delete obj.query.hash;
  obj.search = undefined;
  window.location = url.format(obj);
}());


(($) => {

  // add pointer events polyfill
  window.pointerEventsPolyfill();

  // initialize spinner with jQuery
  const spinner = new Spinner($);

  // ajax form submission with frisbee
  // and sweetalert2 message response
  // and built-in support for Stripe Checkout
  async function ajaxForm(ev) {

    // prevent default form submission
    ev.preventDefault();

    // get the form
    const $form = $(this);

    // if the form requires Stripe checkout token
    // then return early and open Stripe checkout
    if ($form.hasClass('stripe-checkout')) {

      if (!window.StripeCheckout)
        return console.error('Stripe checkout missing');

      // lookup email input for later
      const $email = $form.find('input[name="stripe_email"]');

      // if there is already a token then continue
      const $token = $form.find('input[name="stripe_token"]');

      if ($token.length === 0)
        return console.error('Missing Stripe token field');

      if ($token.val() === '') {

        // fetch token for the user
        const handler = window.StripeCheckout.configure({
          key: window.STRIPE_PUBLISHABLE_KEY,
          image: 'https://s3.amazonaws.com/stripe-uploads/acct_190PpgK23394iDwBmerchant-icon-1475475942141-apple-touch-icon.png',
          locale: 'auto',
          token: (token) => {
            // you can access the token ID with `token.id`.
            // get the token ID to your server-side code for use
            $token.val(token.id);
            // also included is `token.email`
            // which we append to the form if
            // there is an `input[name=email]`
            if ($email.length !== 0)
              $email.val(token.email);
            ajaxForm.call(this, ev);
          }
        });

        handler.open({
          allowRememberMe: false,
          ... $form.data()
        });

        $(window).on('popstate', () => handler.close());

        return;

      }

    }

    // show the spinner
    spinner.show();

    // disable submit button so we can't resubmit the form
    const $btns = $form.find('input[type="submit"], button[type="submit"]');
    $btns.prop('disabled', true).addClass('disabled');

    // determine the path we're sending the request to
    let action = $form.attr('action');

    // if the action is missing a starting forward slash then append it
    if (action.indexOf('/') !== 0)
      action = `/${action}`;

    // determine the method of the HTTP request
    let method = $form.attr('method');

    // default to GET request
    if (!method) method = 'GET';

    // take into account method override middleware
    if (method === 'POST' && $form.find('input[name="_method"]').length)
      method = $form.find('input[name="_method"]').val();

    try {

      // set default headers
      const headers = { ...defaultHeaders };

      // if the form contains a file input, then we need to use FormData
      // otherwise we can just use querystring parsing to assemble body
      let body = {};

      if ($form.find('input[type="file"]').length) {
        body = new FormData($form.get(0));
        // remove content-type header so boundary can be added for multipart forms
        // http://stackoverflow.com/a/35799817
        delete headers['Content-Type'];
      } else {
        body = qs.parse($form.serialize());
      }

      const opts = {
        headers,
        body,
        // add cookie support for CSRF/sessions
        credentials: 'same-origin',
        cache: 'no-cache'
      };

      // send the request
      const res = await api[method.toLowerCase()](action, opts);

      // check if any errors occurred
      if (res.err) throw res.err;

      // either display a success message, redirect user, or reload page
      if (!_.isObject(res.body)) {
        console.error('Response was not an object', res);
        // hide the spinner
        spinner.hide();
        // show message
        swal(window._types.error, 'Invalid response, please try again', 'error');
      } else if (_.isString(res.body.redirectTo)) {
        if (!_.isString(res.body.message)
          || (_.isBoolean(res.body.autoRedirect) && res.body.autoRedirect)) {
          // reset the form
          $form.get(0).reset();
          // redirect
          window.location = res.body.redirectTo;
        } else {
          // hide the spinner
          spinner.hide();
          // show message
          await swal(window._types.success, res.body.message, 'success');
          // reset the form
          $form.get(0).reset();
          // redirect
          window.location = res.body.redirectTo;
        }
      } else if (_.isString(res.body.message)) {

        // hide the spinner
        spinner.hide();
        // show message
        await swal(window._types.success, res.body.message, 'success');
        // reset the form
        $form.get(0).reset();

        // reload page
        if ((_.isBoolean(res.body.reloadPage) && res.body.reloadPage))
          window.location.reload();

      } else {
        // hide the spinner
        spinner.hide();
        // show message
        swal(window._types.success, JSON.stringify(res.body, null, 2), 'success');
        // reset the form
        $form.get(0).reset();
      }

    } catch (err) {

      // hide the spinner
      spinner.hide();

      // show error message
      swal(window._types.error, err.message, 'error');

    } finally {

      // re-enable form buttons
      $btns.prop('disabled', false).removeClass('disabled');

    }

  }

  // if the page gets resized, and on page load
  // detect the height of the top navbar and
  // set it as the `padding-top` property of body
  function resizeNavbarPadding() {
    const $navbarFixedTop = $('.navbar-fixed-top');
    if ($navbarFixedTop.length === 0) return;
    $('body').css('padding-top', $navbarFixedTop.outerHeight());
  }

  $(() => {

    // resize navbar padding on load
    resizeNavbarPadding();
    $(window).on('resize.resizeNavbarPadding', resizeNavbarPadding);

    // detect when we scroll to the #the-web-server selector
    // so that we can hide the "Learn More" banner on bottom
    if ($('#learn-more').length && $('#the-web-server').length) {
      const waypoint = new window.Waypoint({
        element: $('#the-web-server').get(0),
        handler: direction => {
          if (direction === 'up')
            $('#learn-more').addClass('in');
          else if (direction === 'down')
            $('#learn-more').removeClass('in');
        },
        offset: '25%'
      });
      // when the page loads we need to make sure its checked
      waypoint.context.refresh();
    }

    // lazy load images using jquery.lazy
    $('img.lazy').Lazy({ retinaAttribute: 'data-2x' });

    // dense for all other non lazy images
    $('img:not(".lazy")').dense({
      glue: '@'
    });

    // support placeholders in older browsers
    $('input, textarea').placeholder();

    // handle hashes when page loads
    // <http://stackoverflow.com/a/29853395>
    function adjustAnchor(ev) {
      const $anchor = $(':target');
      const $navbarFixedTop = $('.navbar-fixed-top');
      if ($anchor.length !== 0 && $navbarFixedTop.length !== 0)
        window.scrollTo(0, $anchor.offset().top - $navbarFixedTop.outerHeight());
    }
    adjustAnchor();
    $(window).on('hashchange', adjustAnchor);
    $('body').on('click', "a[href^='#']", function (ev) {
      if (window.location.hash === $(this).attr('href')) {
        ev.preventDefault();
        adjustAnchor();
      }
    });


    // automatically show tooltips and popovers
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();


    // handle custom file inputs
    $('body').on('change', 'input[type="file"][data-toggle="custom-file"]', function (ev) {

      const $input = $(this);
      const target = $input.data('target');
      const $target = $(target);

      if (!$target.length)
        return console.error('Invalid target for custom file', $input);

      if (!$target.attr('data-content'))
        return console.error('Invalid `data-content` for custom file target', $input);

      // set original content so we can revert if user deselects file
      if (!$target.attr('data-original-content'))
        $target.attr('data-original-content', $target.attr('data-content'));

      const input = $input.get(0);

      let name = _.isObject(input)
        && _.isObject(input.files)
        && _.isObject(input.files[0])
        && _.isString(input.files[0].name) ? input.files[0].name : $input.val();

      if (_.isNull(name) || name === '')
        name = $target.attr('data-original-content');

      $target.attr('data-content', name);

    });


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


    // bind ajax form submission
    $('body').on('submit', 'form.ajax-form', ajaxForm);

  });

})(jQuery);
