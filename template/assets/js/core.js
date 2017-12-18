// eslint-disable-next-line import/no-unassigned-import
require('babel-polyfill');

const WebFont = require('webfontloader');
const es6promise = require('es6-promise');
const History = require('html5-history-api');
const jQuery = require('jquery');
const Popper = require('popper.js');

const clipboard = require('./clipboard');
const returnTo = require('./return-to');
const facebookHashFix = require('./facebook-hash-fix');
const changeHashOnScroll = require('./change-hash-on-scroll');
const customFileInput = require('./custom-file-input');
const confirmPrompt = require('./confirm-prompt');
const ajaxForm = require('./ajax-form');
const jumpTo = require('./jump-to');

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
  google: { families: ['Source+Code+Pro', 'Source+Sans+Pro', 'Bitter'] }
});

// Fix Facebook's appended hash bug
facebookHashFix();

// Allow ?return_to=/some/path
returnTo();

($ => {
  // Add pointer events polyfill
  window.pointerEventsPolyfill();

  // If the page gets resized, and on page load
  // detect the height of the top navbar and
  // set it as the `padding-top` property of body
  const resizeNavbarPadding = () => {
    const $navbarFixedTop = $('.navbar.fixed-top');
    if ($navbarFixedTop.length === 0) return;
    $('body').css('padding-top', $navbarFixedTop.outerHeight());
  };

  $(() => {
    // Resize navbar padding on load
    resizeNavbarPadding();
    $(window).on('resize.resizeNavbarPadding', resizeNavbarPadding);

    // Handle hashes when page loads
    // <http://stackoverflow.com/a/29853395>
    if (window.location.hash !== '') jumpTo(window.location.hash);

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
          jumpTo(hash);
        }, 1);
      });
    }

    // Handle hash change when user clicks on links
    $('body').on('click.handleHashChange', "a[href^='#']", ev => {
      ev.preventDefault();
      jumpTo($(ev.currentTarget).attr('href'));
    });

    // Automatically show tooltips and popovers
    $('[data-toggle="tooltip"]').tooltip();
    $('[data-toggle="popover"]').popover();

    // Handle custom file inputs
    $('body').on(
      'change.customFileInput',
      'input[type="file"][data-toggle="custom-file"]',
      customFileInput
    );

    // Handle clipboard copy event
    clipboard();

    // Bind confirm prompt event for clicks and form submissions
    $('body').on(
      'submit.confirmPrompt',
      'form.confirm-prompt, form[data-toggle="confirm-prompt"]',
      confirmPrompt
    );
    $('body').on(
      'click.confirmPrompt',
      'button.confirm-prompt, input.confirm-prompt',
      confirmPrompt
    );

    // Bind ajax form submission
    $('body').on('submit.ajaxForm', 'form.ajax-form', ajaxForm);
  });
})(window.$);
