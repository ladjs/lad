// Remove the ugly Facebook appended hash
// <https://github.com/jaredhanson/passport-facebook/issues/12>
module.exports = () => {
  if (window.location.hash !== '' && window.location.hash !== '#_=_') return;
  window.history.replaceState(
    undefined,
    undefined,
    window.location.pathname + window.location.search
  );
};
