
(function(window, $) {
  'use strict';

  var html = window.jade['client-side-test']({
    colors: [ '#ff0000', '#ffff00', '#00ffff', '#f2a5ae', '#a35a3f' ]
  });

  $(function() {
    $('body').append(html);
  });

}(window, jQuery));
