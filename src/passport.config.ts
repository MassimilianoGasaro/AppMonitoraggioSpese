import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import User, { UserDocument } from './models/user';

// Configura la strategia di autenticazione locale
passport.use(new LocalStrategy({
  usernameField: 'email', // Campo del modulo di login che corrisponde all'email
  passwordField: 'password' // Campo del modulo di login che corrisponde alla password
}, async (email, password, done) => {
  try {
    // Trova l'utente nel database tramite l'email
    const user: UserDocument | null = await User.findOne({ email });

    // Se l'utente non esiste o la password non corrisponde, restituisci un errore
    if (!user || !(await user.comparePassword(password))) {
      return done(null, false, { message: 'Email o password non validi' });
    }

    // Se l'utente esiste e la password corrisponde, restituisci l'utente
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

// Serializza l'utente per memorizzarlo nella sessione
passport.serializeUser<UserDocument, any>((user, done) => {
    process.nextTick(function() {
        done(null, { id: user.id });
    });
});

// Deserializza l'utente per recuperarlo dalla sessione
passport.deserializeUser<UserDocument, any>((id, done) => {
  User.findById(id, (err: any, user: any) => {
    done(err, user);
  });
});
