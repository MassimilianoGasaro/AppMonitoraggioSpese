import passport from 'passport';
import { Strategy as Auth0Strategy, Profile } from 'passport-auth0';
import config from './config';

passport.serializeUser<any, any>((user: any, done: any) => {
    done(null, user._id);
});

passport.deserializeUser<any, any>((user, done) => {
    done(null, user);
});

passport.use(new Auth0Strategy(
    {
        domain: config.auth0.domain,
        clientID: config.auth0.clientID,
        clientSecret: config.auth0.clientSecret,
        callbackURL: config.auth0.callbackURL
    },
    (accessToken, refreshToken, extraParams, profile: Profile, done) => {
        return done(null, profile);
    }
));
