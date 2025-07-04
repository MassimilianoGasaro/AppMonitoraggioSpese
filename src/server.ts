import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import { Logger } from "winston";
import logger from "./logger/logger";
import passport from "passport";
import { callback, login, register } from "./controllers/auth";
import { isAuthenticated } from "./middlewares/auth";

dotenv.config();

const app = express();

app.use(cors({
    credentials: true,
}));
app.use(bodyParser.json()); // gestisci il body come json

const secret_ses: string | undefined = process.env.SESSION_SECRET?.toString();
// Configura la sessione
app.use(session({
    secret: secret_ses ?? "",
    resave: true,
    saveUninitialized: true
}));

// Inizializza Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Rotte
app.get('/', (req, res) => {
    res.send('Benvenuto!');
});

app.post('/register', register);
app.get('/login', login);
app.get('/callback', callback);

// Rotta protetta
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.send('Dashboard protetta');
});

const PORT = process.env.PORT;
const uri: string | undefined = process.env.CONNECTION_STRING;
const server = http.createServer(app);

if (uri) {
    mongoose.connect(uri)
    .then(() => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
            logger.info("connection is opened!");
            server.listen(PORT, () => {
                logger.info(`Server is running at http://localhost:${PORT}/`);
            });
        }, err => { /** handle initial connection error */ 
            logger.error(`${err}`);
        });
}