module.exports = {
  // <https://github.com/pillarjs/cookies#cookiesset-name--value---options-->
  // <https://github.com/koajs/generic-session/blob/master/src/session.js#L32-L38>
  httpOnly: true,
  path: '/',
  overwrite: true,
  signed: true,
  maxAge: 24 * 60 * 60 * 1000,
  secure: process.env.WEB_PROTOCOL === 'https',
  // we use SameSite cookie support as an alternative to CSRF
  // <https://scotthelme.co.uk/csrf-is-dead/>
  // 'strict' is ideal, but would cause issues when redirecting out
  // for oauth flows to github, google, etc.
  sameSite: 'lax'
};
