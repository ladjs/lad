
(function(window) {

  // Remove the ugly Facebook appended hash
  // <https://github.com/jaredhanson/passport-facebook/issues/12>
  (function removeFacebookAppendedHash() {
    if (!window.location.hash || window.location.hash !== '#_=_')
      return;
    if (window.history && window.history.replaceState)
      return window.history.replaceState("", document.title, window.location.pathname);
    // Prevent scrolling by storing the page's current scroll offset
    var scroll = {
      top: document.body.scrollTop,
      left: document.body.scrollLeft
    };
    window.location.hash = "";
    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scroll.top;
    document.body.scrollLeft = scroll.left;
  }());

}(window));
