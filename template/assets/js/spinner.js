class Spinner {
  constructor($, selector) {
    this.$ = $;
    this.selector = selector || '#spinner';
  }

  show() {
    this.$(this.selector).addClass('in d-block');
  }

  hide() {
    this.$(this.selector).removeClass('in d-block');
  }
}

module.exports = Spinner;
