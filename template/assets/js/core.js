const History = require('html5-history-api');
const $ = require('jquery');
const Popper = require('popper.js');

// load jQuery and Bootstrap
// <https://stackoverflow.com/a/34340392>
// <https://github.com/FezVrasta/popper.js/issues/287#issuecomment-321887784>
window.$ = $;
window.jQuery = $;

// required for bootstrap (we could use the bundle but this is cleaner)
window.Popper = Popper;

// eslint-disable-next-line import/no-unassigned-import
require('bootstrap');

const {
  ajaxForm,
  changeHashOnScroll,
  clipboard,
  confirmPrompt,
  customFileInput,
  facebookHashFix,
  flash,
  returnTo,
  resizeNavbarPadding,
  modalAnchor,
  handleHashOnLoad,
  handleHashChange
} = require('@ladjs/assets');

// import waypoints (see below example for how to use + `yarn add waypoints`)
// require('waypoints/lib/jquery.waypoints.js');

// import pointer events polyfill for ie
// eslint-disable-next-line import/no-unassigned-import
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

// Add pointer events polyfill
window.pointerEventsPolyfill();

// Fix Facebook's appended hash bug
facebookHashFix();

// Allow ?return_to=/some/path
returnTo();

// flash and toast messaging with sweetalert2
flash();

// Handle hashes when page loads
// <http://stackoverflow.com/a/29853395>
handleHashOnLoad();

$(() => {
  // Resize navbar padding on load, window resize, and navbar collapse/show
  resizeNavbarPadding($);
  $(window).on('resize.resizeNavbarPadding', () => {
    resizeNavbarPadding($);
  });
  $('.navbar-collapse').on('hidden.bs.collapse shown.bs.collapse', () => {
    resizeNavbarPadding($);
  });

  // Handle modals on anchor tags with data-target specified (preserve href)
  $('a[data-toggle="modal-anchor"]').on('click.modalAnchor', modalAnchor);

  // Lazy load images using jquery.lazy
  $('img.lazy').lazy({ retinaAttribute: 'data-2x' });

  // Dense for all other non lazy images
  $('img:not(".lazy")').dense({ glue: '@' });

  // Support placeholders in older browsers using jquery-placeholder
  $('input, textarea').placeholder();

  // Adjust the hash of the page as you scroll down
  // (e.g. if you scroll past a section "Section A" to "Section B"
  // then the URL bar will update to #section-b
  $(window).on('scroll.changeHashOnScroll', changeHashOnScroll);

  // Handle hash change when user clicks on links
  $('body').on('click.handleHashChange', "a[href^='#']", handleHashChange);

  // Automatically show tooltips and popovers
  $('[data-toggle="tooltip"]').tooltip();
  $('[data-toggle="popover"]').popover();

  // Handle custom file inputs
  //
  // Example usage:
  //
  // <label class="d-block">
  //   <input required="required" data-toggle="custom-file" data-target="#company-logo" type="file" name="company_logo" accept="image/*" class="custom-file-input">
  //   <span id="company-logo" class="custom-file-control custom-file-name" data-btn="{{ t('Select File') }}" data-content="{{ t('Upload company logo...') }}"></span>
  // </label>
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

  // Bind ajax form submission and handle Stripe tokens in forms
  $('body').on('submit.ajaxForm', 'form.ajax-form', ajaxForm);

  // Example for how to detect waypoint scrolling:
  //
  // Detect when we scroll to the #the-web-server selector
  // so that we can hide the "Learn More" banner on bottom
  /*
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
  */
});
