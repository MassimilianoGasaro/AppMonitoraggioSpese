import passport from 'passport';
import { Strategy as Auth0Strategy } from 'passport-auth0';
import { User } from '../models/user';

// Verifica che le variabili d'ambiente siano caricate
const domain = process.env.AUTH0_DOMAIN;
const clientID = process.env.AUTH0_CLIENT_ID;
const clientSecret = process.env.AUTH0_CLIENT_SECRET;
const callbackURL = process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback';

if (!domain || !clientID || !clientSecret) {
    throw new Error('Variabili d\'ambiente Auth0 mancanti. Verifica il file .env');
}

// Configurazione della strategia Auth0
passport.use(new Auth0Strategy({
    domain,
    clientID,
    clientSecret,
    callbackURL
}, async (accessToken: string, refreshToken: string, extraParams: any, profile: any, done: any) => {
    try {
        // Cerca l'utente nel database
        let user = await User.findOne({ email: profile.emails[0].value });
        
        // if (!user) {
        //     // Se l'utente non esiste, crealo
        //     user = new User({
        //         name: profile.name.givenName,
        //         surname: profile.name.familyName,
        //         email: profile.emails[0].value,
        //         password: '', // Auth0 gestisce l'autenticazione
        //         dateOfSubscribe: new Date().toISOString()
        //     });
        //     await user.save();
        // }
        
        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

// Serializzazione dell'utente per la sessione
passport.serializeUser((user: any, done) => {
    done(null, user._id);
});

// Deserializzazione dell'utente dalla sessione
passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;
