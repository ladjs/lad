const $ = require('jquery');

class Spinner {
  constructor(selector) {
    this.selector = selector || '#spinner';
  }

  show() {
    $(this.selector).addClass('in d-block');
  }

  hide() {
    $(this.selector).removeClass('in d-block');
  }
}

module.exports = Spinner;
