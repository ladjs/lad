const test = require('ava');

const { json, emoji } = require('../../config/utilities');

test('returns JSON with 2 spaces', (t) => {
  t.snapshot(json({ ok: 'hey' }));
});

test('returns valid emoji or empty string', (t) => {
  t.is(emoji('cat'), '🐱');
  t.is(emoji('invalid_emoji'), '');
});
