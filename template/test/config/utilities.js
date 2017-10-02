const test = require('ava');
const { json, emoji } = require('../../config/utilities');

test('returns JSON with 2 spaces', t => {
  t.snapshot(json({ ok: 'hey' }));
});

test('returns correct emoji', t => {
  t.is(emoji('cat'), '🐱');
});
