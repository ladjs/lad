
import passport from 'koa-passport';
import _ from 'lodash';
import {
  OAuth2Strategy as GoogleStrategy
} from 'passport-google-oauth';

import { Users } from '../app/models';
import config from '../config';

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
  try {
    const user = await Users.findOne({ email });
    // if no user exists then invalidate the previous session
    // <https://github.com/jaredhanson/passport/issues/6#issuecomment-4857287>
    if (!user) return done(null, false);
    // otherwise continue along
    done(null, user);
  } catch (err) {
    done(err);
  }
});

if (config.auth.local)
  passport.use(Users.createStrategy());

if (config.auth.providers.google)
  passport.use(new GoogleStrategy(
    config.auth.strategies.google,
    async (accessToken, refreshToken, profile, done) => {

      const email = profile.emails[0].value;

      try {

        let user = await Users.findByEmail(email);

        if (!user) {

          // there is still a bug that doesn't let us revoke tokens
          // in order for us to get a new refresh token per:
          // <http://stackoverflow.com/a/18578660>
          // so instead we explicitly send them to the google url
          // with `prompt=consent` specified (this rarely happens)
          if (!refreshToken)
            return done(new Error('Consent required'));

          const obj = {
            email: email,
            display_name: profile.displayName,
            given_name: profile.name.givenName,
            family_name: profile.name.familyName,
            google_profile_id: profile.id,
            google_access_token: accessToken,
            google_refresh_token: refreshToken
          };

          if (_.isObject(profile._json.image)
              && _.isString(profile._json.image.url)) {
            obj.avatar_url = profile._json.image.url;
            // we don't want ?sz= in the image URL
            obj.avatar_url = obj.avatar_url.split('?sz=')[0];
          }

          user = await Users.create(obj);

        } else {

          // store the access token and refresh token
          if (accessToken)
            user.set('google_access_token', accessToken);
          if (refreshToken)
            user.set('google_refresh_token', refreshToken);
          user = await user.save();

        }

        done(null, user.toObject());

      } catch (err) {
        done(err);
      }

    }
  ));

export default passport;
