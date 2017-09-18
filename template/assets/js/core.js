// eslint-disable-next-line import/no-unassigned-import
require('babel-polyfill');

// add required support for global `fetch` method
// *this must always come before `frisbee` is imported*
// eslint-disable-next-line import/no-unassigned-import
require('isomorphic-fetch');

const qs = require('querystring');
const url = require('url');
const s = require('underscore.string');
const _ = require('lodash');
const swal = require('sweetalert2');
const Frisbee = require('frisbee');
const WebFont = require('webfontloader');
const es6promise = require('es6-promise');
const Clipboard = require('clipboard');
const History = require('html5-history-api');
const jQuery = require('jquery');
const Popper = require('popper.js');

const Spinner = require('./spinner');

// load jQuery and Bootstrap
// <https://stackoverflow.com/a/34340392>
// <https://github.com/FezVrasta/popper.js/issues/287#issuecomment-321887784>
window.$ = jQuery;
window.jQuery = window.$;

// required by bootstrap
window.Popper = Popper;

// import waypoints
// eslint-disable-next-line import/no-unassigned-import
require('waypoints/lib/jquery.waypoints.js');

// import pointer events polyfill for ie
// eslint-disable-next-line import/no-unassigned-import,max-len
require('jquery.pointer-events-polyfill/dist/jquery.pointer-events-polyfill.min.js');

// import jquery lazy
// eslint-disable-next-line import/no-unassigned-import
require('jquery-lazy');

// import dense for images
// eslint-disable-next-line import/no-unassigned-import
require('dense/src/dense.js');

// import jquery-placeholder for IE placeholder support
// eslint-disable-next-line import/no-unassigned-import
require('jquery-placeholder');

// import history fallback support for IE
window.History = History;

// eslint-disable-next-line import/no-unassigned-import
require('bootstrap');

// Add optional support for older browsers
es6promise.polyfill();

// Google web fonts
WebFont.load({
  google: { families: ['Source+Code+Pro', 'Roboto:300,400', 'Montserrat'] }
});

// Create a new instance of Frisbee
const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'X-CSRF-Token': window._csrf
};
const api = new Frisbee({
  baseURI: window.location.origin,
  headers: defaultHeaders
});

// Remove the ugly Facebook appended hash
// <https://github.com/jaredhanson/passport-facebook/issues/12>
(() => {
  if (window.location.hash !== '' && window.location.hash !== '#_=_') return;
  window.history.replaceState(
    undefined,
    undefined,
    window.location.pathname + window.location.search
  );
})();

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
(() => {
  const obj = url.parse(window.location.href, {
    parseQueryString: true
  });
  if (
    !_.isObject(obj.query) ||
    !_.isString(obj.query.hash) ||
    s.isBlank(obj.query.hash)
  )
    return;
  obj.hash = obj.query.hash;
  delete obj.query.hash;
  obj.search = undefined;
  window.location = url.format(obj);
})();

($ => {
  // Add pointer events polyfill
  window.pointerEventsPolyfill();

  // Initialize spinner with jQuery
  const spinner = new Spinner($);

  // Ajax form submission with frisbee
  // and sweetalert2 message response
  // and built-in support for Stripe Checkout
  async function ajaxForm(ev) {
    // Prevent default form submission
    ev.preventDefault();

    // Get the form
    const $form = $(this);

    // If the form requires Stripe checkout token
    // then return early and open Stripe checkout
    if ($form.hasClass('stripe-checkout')) {
      if (!window.StripeCheckout)
        return console.error('Stripe checkout missing');

      // Lookup email input for later
      const $email = $form.find('input[name="stripe_email"]');

      // If there is already a token then continue
      const $token = $form.find('input[name="stripe_token"]');

      if ($token.length === 0)
        return console.error('Missing Stripe token field');

      if ($token.val() === '') {
        // Fetch token for the user
        const handler = window.StripeCheckout.configure({
          key: window.STRIPE_PUBLISHABLE_KEY,
          image:
            'https://s3.amazonaws.com/stripe-uploads/acct_190PpgK23394iDwBmerchant-icon-1475475942141-apple-touch-icon.png',
          locale: 'auto',
          token: token => {
            // You can access the token ID with `token.id`.
            // get the token ID to your server-side code for use
            $token.val(token.id);
            // Also included is `token.email`
            // which we append to the form if
            // there is an `input[name=email]`
            if ($email.length !== 0) $email.val(token.email);
            ajaxForm.call(this, ev);
          }
        });

        handler.open({
          allowRememberMe: false,
          ...$form.data()
        });

        $(window).on('popstate', () => handler.close());

        return;
      }
    }

    // Show the spinner
    spinner.show();

    // Disable submit button so we can't resubmit the form
    const $btns = $form.find('input[type="submit"], button[type="submit"]');
    $btns.prop('disabled', true).addClass('disabled');

    // Determine the path we're sending the request to
    let action = $form.attr('action');

    // If the action is missing a starting forward slash then append it
    if (action.indexOf('/') !== 0) action = `/${action}`;

    // Determine the method of the HTTP request
    let method = $form.attr('method');

    // Default to GET request
    if (!method) method = 'GET';

    // Take into account method override middleware
    if (method === 'POST' && $form.find('input[name="_method"]').length > 0)
      method = $form.find('input[name="_method"]').val();

    try {
      // Set default headers
      const headers = {
        ...defaultHeaders
      };

      // If the form contains a file input, then we need to use FormData
      // otherwise we can just use querystring parsing to assemble body
      let body = {};

      if ($form.find('input[type="file"]').length > 0) {
        body = new FormData(this);
        // remove content-type header so boundary is added for multipart forms
        // http://stackoverflow.com/a/35799817
        headers['Content-Type'] = undefined;
      } else {
        body = qs.parse($form.serialize());
      }

      const opts = {
        headers,
        body,
        // Add cookie support for CSRF/sessions
        credentials: 'same-origin',
        cache: 'no-cache'
      };

      // Send the request
      const res = await api[method.toLowerCase()](action, opts);

      // Check if any errors occurred
      if (res.err) throw res.err;

      // Either display a success message, redirect user, or reload page
      if (!_.isObject(res.body)) {
        console.error('Response was not an object', res);
        // Hide the spinner
        spinner.hide();
        // Show message
        swal(
          window._types.error,
          'Invalid response, please try again',
          'error'
        );
      } else if (_.isString(res.body.redirectTo)) {
        if (
          !_.isString(res.body.message) ||
          (_.isBoolean(res.body.autoRedirect) && res.body.autoRedirect)
        ) {
          // Reset the form
          $form.get(0).reset();
          // Redirect
          window.location = res.body.redirectTo;
        } else {
          // Hide the spinner
          spinner.hide();
          // Show message
          swal(window._types.success, res.body.message, 'success');
          // Reset the form
          $form.get(0).reset();
          // Redirect
          window.location = res.body.redirectTo;
        }
      } else if (_.isString(res.body.message)) {
        // Hide the spinner
        spinner.hide();
        // Show message
        swal(window._types.success, res.body.message, 'success');
        // Reset the form
        $form.get(0).reset();

        // Reload page
        if (_.isBoolean(res.body.reloadPage) && res.body.reloadPage)
          window.location.reload();
      } else {
        // Hide the spinner
        spinner.hide();
        // Show message
        swal(
          window._types.success,
          JSON.stringify(res.body, null, 2),
          'success'
        );
        // Reset the form
        $form.get(0).reset();
      }
    } catch (err) {
      // Hide the spinner
      spinner.hide();

      // Show error message
      swal(window._types.error, err.message, 'error');
    } finally {
      // Re-enable form buttons
      $btns.prop('disabled', false).removeClass('disabled');
    }
  }

  // If the page gets resized, and on page load
  // detect the height of the top navbar and
  // set it as the `padding-top` property of body
  function resizeNavbarPadding() {
    const $navbarFixedTop = $('.navbar.fixed-top');
    if ($navbarFixedTop.length === 0) return;
    $('body').css('padding-top', $navbarFixedTop.outerHeight());
  }

  $(() => {
    // Resize navbar padding on load
    resizeNavbarPadding();
    $(window).on('resize.resizeNavbarPadding', resizeNavbarPadding);

    // Handle hashes when page loads
    // <http://stackoverflow.com/a/29853395>
    if (window.location.hash !== '') jumpToTarget(window.location.hash);

    // Resize navbar padding when navbar is shown/collapsed
    $('.navbar-collapse').on('hidden.bs.collapse', resizeNavbarPadding);
    $('.navbar-collapse').on('shown.bs.collapse', resizeNavbarPadding);

    // Detect when we scroll to the #the-web-server selector
    // so that we can hide the "Learn More" banner on bottom
    if ($('#learn-more').length > 0 && $('#the-web-server').length > 0) {
      const waypoint = new window.Waypoint({
        element: $('#the-web-server').get(0),
        handler: direction => {
          if (direction === 'up') $('#learn-more').addClass('show');
          else if (direction === 'down') $('#learn-more').removeClass('show');
        },
        offset: '25%'
      });
      // When the page loads we need to make sure its checked
      waypoint.context.refresh();
    }

    // Lazy load images using jquery.lazy
    $('img.lazy').lazy({
      retinaAttribute: 'data-2x'
    });

    // Dense for all other non lazy images
    $('img:not(".lazy")').dense({
      glue: '@'
    });

    // Support placeholders in older browsers
    $('input, textarea').placeholder();

    // Handle hashes when page scrolls
    // <https://stackoverflow.com/a/5315993>
    function changeHashOnScroll() {
      // If we're at the top of the page then remove the hash
      if (window.pageYOffset === 0)
        return window.history.replaceState(
          undefined,
          undefined,
          window.location.pathname + window.location.search
        );

      const $navbarFixedTop = $('.navbar.fixed-top');
      const extraHeight = $navbarFixedTop.length
        ? $navbarFixedTop.outerHeight()
        : 0;
      const $target =
        window.location.hash === '' ? null : $(window.location.hash);

      $(':header[id]')
        .not($target)
        .each(function() {
          const beginsBeforeTop =
            $(this).offset().top < window.pageYOffset + extraHeight;
          const endsInVisibleArea =
            $(this).offset().top + $(this).height() >
            window.pageYOffset + extraHeight;
          if (!beginsBeforeTop || !endsInVisibleArea) return;
          // Remove id and then add it back to prevent scroll
          // <https://stackoverflow.com/a/1489802>
          const id = $(this).attr('id');
          $(this).removeAttr('id');
          window.history.replaceState(undefined, undefined, `#${id}`);
          $(this).attr('id', id);
        });
    }
    $(window).on('scroll.changeHashOnScroll', changeHashOnScroll);

    // Handle hashes when page loads
    // <http://stackoverflow.com/a/29853395>
    if (window.location.hash !== '') {
      const hash = window.location.hash;
      const $hash = $(window.location.hash);
      if ($hash.length === 0) return;
      $hash.removeAttr('id');
      $(window).load(() => {
        $hash.attr('id', hash.substring(1));
        setTimeout(() => {
          jumpToTarget(hash);
        }, 1);
      });
    }

    // Handle hash change when user clicks on links
    $('body').on('click', "a[href^='#']", function(ev) {
      ev.preventDefault();
      jumpToTarget($(this).attr('href'));
    });

    function jumpToTarget(target) {
      if (s.isBlank(target) || target === '#') return;
      const $target = $(target);
      if ($target.length === 0) return;
      // Remove id and then add it back to prevent scroll
      // <https://stackoverflow.com/a/1489802>
      const id = $target.attr('id');
      $target.removeAttr('id');
      window.history.replaceState(undefined, undefined, `#${id}`);
      $target.attr('id', id);
      let offsetTop = $target.offset().top;
      offsetTop -= Number($target.css('marginTop'));
      offsetTop -= Number($target.css('paddingTop'));
      if ($('.navbar.fixed-top').length > 0)
        offsetTop -= $('.navbar.fixed-top').outerHeight();
      window.scrollTo(0, offsetTop);
    }

    // Automatically show tooltips and popovers
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    // Handle custom file inputs
    $(
      'body'
    ).on('change', 'input[type="file"][data-toggle="custom-file"]', function() {
      const $input = $(this);
      const target = $input.data('target');
      const $target = $(target);

      if ($target.length === 0)
        return console.error('Invalid target for custom file', $input);

      if (!$target.attr('data-content'))
        return console.error(
          'Invalid `data-content` for custom file target',
          $input
        );

      // Set original content so we can revert if user deselects file
      if (!$target.attr('data-original-content'))
        $target.attr('data-original-content', $target.attr('data-content'));

      const input = $input.get(0);

      let name =
        _.isObject(input) &&
        _.isObject(input.files) &&
        _.isObject(input.files[0]) &&
        _.isString(input.files[0].name)
          ? input.files[0].name
          : $input.val();

      if (_.isNull(name) || name === '')
        name = $target.attr('data-original-content');

      $target.attr('data-content', name);
    });

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
    } else {
      $('[data-toggle-clipboard]').addClass('hidden');
    }

    // Bind ajax form submission
    $('body').on('submit', 'form.ajax-form', ajaxForm);
  });
})(window.$);
