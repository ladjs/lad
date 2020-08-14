const path = require('path');
const test = require('ava');
const sao = require('sao');

const template = path.join(__dirname, '..');

const defaults = {
  name: 'lad',
  description: 'my project description',
  author: 'Nick Baugh',
  email: 'niftylettuce@gmail.com',
  website: 'http://niftylettuce.com',
  username: 'niftylettuce'
};

test('defaults', async (t) => {
  const stream = await sao.mockPrompt(template, {
    ...defaults,
    name: 'my-package-name'
  });
  t.snapshot(
    stream.fileList
      .sort()
      .filter(
        (name) =>
          !name.includes('/snapshots') &&
          !name.startsWith('.base64-cache/') &&
          !name.startsWith('locales/')
      ),
    'generated files'
  );
  const content = stream.fileContents('README.md');
  t.snapshot(content, 'content of README.md');
});

test('invalid name', async (t) => {
  const error = await t.throwsAsync(
    sao.mockPrompt(template, { ...defaults, name: 'Foo Bar Baz Beep' })
  );
  t.regex(error.message, /package name cannot have uppercase letters/);
});

test('invalid email', async (t) => {
  const error = await t.throwsAsync(
    sao.mockPrompt(template, { ...defaults, email: 'niftylettuce' })
  );
  t.regex(error.message, /Invalid email/);
});

test('invalid website', async (t) => {
  const error = await t.throwsAsync(
    sao.mockPrompt(template, { ...defaults, website: 'niftylettuce' })
  );
  t.regex(error.message, /Invalid URL/);
});

test('invalid username', async (t) => {
  const error = await t.throwsAsync(
    sao.mockPrompt(template, { ...defaults, username: '$$$' })
  );
  t.regex(error.message, /Invalid GitHub username/);
});

test('invalid repo', async (t) => {
  const error = await t.throwsAsync(
    sao.mockPrompt(template, {
      ...defaults,
      username: 'lassjs',
      repo: 'https://bitbucket.org/foo/bar'
    })
  );
  t.regex(
    error.message,
    /Please include a valid GitHub.com URL without a trailing slash/
  );
});
