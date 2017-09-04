import Script from '../../';

function beforeEach(t) {
  const script = new Script({});
  Object.assign(t.context, { script });
}

function afterEach() {}

export { beforeEach, afterEach };
