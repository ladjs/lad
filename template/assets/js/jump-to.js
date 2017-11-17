const $ = require('jquery');
const s = require('underscore.string');

const jumpTo = target => {
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

  if ($('.navbar.fixed-top').length > 0) {
    offsetTop -= $('.navbar.fixed-top').outerHeight();
  }
  window.scrollTo(0, offsetTop);
};

module.exports = jumpTo;
