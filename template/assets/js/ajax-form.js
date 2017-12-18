const qs = require('querystring');
const $ = require('jquery');
const _ = require('lodash');
const Frisbee = require('frisbee');
const swal = require('sweetalert2');
const s = require('underscore.string');

const Spinner = require('./spinner');

// Ajax form submission with frisbee
// and sweetalert2 message response
// and built-in support for Stripe Checkout
// eslint-disable-next-line complexity
const ajaxForm = async function(ev) {
  // Prevent default form submission
  ev.preventDefault();

  // Get the form
  const $form = $(ev.currentTarget);

  // Return early if we're using `confirm-prompt` plugin
  // and it has not yet been confirmed
  if (
    ($form.hasClass('confirm-prompt') || $form.data('toggle') === 'confirm-prompt') &&
    !$form.data('confirmed')
  )
    return false;

  // Initialize spinner
  const spinner = new Spinner();

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

  // If the form requires Stripe checkout token
  // then return early and open Stripe checkout
  if ($form.hasClass('stripe-checkout')) {
    if (!window.StripeCheckout) return console.error('Stripe checkout missing');

    // Lookup email input for later
    const $email = $form.find('input[name="stripe_email"]');

    // If there is already a token then continue
    const $token = $form.find('input[name="stripe_token"]');

    if ($token.length === 0) return console.error('Missing Stripe token field');

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

  // Consider that DELETE needs to be mapped to DEL since fetch uses `.del`
  if (method === 'DELETE') method = 'DEL';

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
      // delete _csrf and _method from the body
      // since they are defined in headers and http method
      body.delete('_csrf');
      body.delete('_method');
      // remove content-type header so boundary is added for multipart forms
      // http://stackoverflow.com/a/35799817
      headers['Content-Type'] = undefined;
    } else {
      body = qs.parse($form.serialize());
      // delete _csrf and _method from the body
      // since they are defined in headers and http method
      delete body._csrf;
      delete body._method;
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
      swal(window._types.error, 'Invalid response, please try again', 'error');
    } else if (!s.isBlank(res.body.redirectTo)) {
      if (
        (_.isBoolean(res.body.autoRedirect) && res.body.autoRedirect) ||
        (s.isBlank(res.body.message) && !_.isObject(res.body.swal))
      ) {
        // Reset the form
        $form.get(0).reset();
        // Redirect
        window.location = res.body.redirectTo;
      } else {
        // Hide the spinner
        spinner.hide();
        // Reset the form
        $form.get(0).reset();
        let config = {};
        if (_.isObject(res.body.swal)) config = res.body.swal;
        else
          config = {
            title: s.isBlank(res.body.title) ? window._types.success : res.body.title,
            type: 'success',
            html: res.body.message
          };
        // Show message
        swal(config).then(() => {
          // Redirect
          window.location = res.body.redirectTo;
        });
      }
    } else if (_.isObject(res.body.swal)) {
      // Hide the spinner
      spinner.hide();
      // Show message
      swal(res.body.swal);
      // Reset the form
      $form.get(0).reset();
    } else if (s.isBlank(res.body.message)) {
      // Hide the spinner
      spinner.hide();
      // Show message
      swal(window._types.success, JSON.stringify(res.body, null, 2), 'success');
      // Reset the form
      $form.get(0).reset();
    } else {
      // Hide the spinner
      spinner.hide();
      // Show message
      swal(window._types.success, res.body.message, 'success');
      // Reset the form
      $form.get(0).reset();
      // Reload page
      if (_.isBoolean(res.body.reloadPage) && res.body.reloadPage) window.location.reload();
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
};

module.exports = ajaxForm;
