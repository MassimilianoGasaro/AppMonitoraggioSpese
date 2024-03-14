import dotenv from 'dotenv';
dotenv.config();

export default {
    auth0: {
        domain: process.env.AUTH0_DOMAIN || '',
        clientID: process.env.AUTH0_CLIENT_ID || '',
        clientSecret: process.env.AUTH0_CLIENT_SECRET || '',
        callbackURL: process.env.AUTH0_CALLBACK_URL || ''
    },
    sessionSecret: process.env.SESSION_SECRET || ''
};