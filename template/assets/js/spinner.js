const $ = require('jquery');

class Spinner {
  constructor(selector) {
    this.selector = selector || '#spinner';
  }

  show() {
    $(this.selector).addClass('show d-block');
  }

  hide() {
    $(this.selector).removeClass('show d-block');
  }
}

module.exports = Spinner;
