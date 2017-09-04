class Script {
  constructor(config) {
    config = config || {};
    this._name = config.name || 'script';
  }
  renderName() {
    return this._name;
  }
}

module.exports = Script;
