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
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();

// CORS
app.use(cors({
    credentials: true,
}));

// Body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Auth e Cookie
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "secret", // Chiave segreta per firmare i cookie
    resave: false,
    saveUninitialized: false,
  })
);

// routes
const apiRouter = express.Router();

// Aggiungi tutte le rotte al router principale
apiRouter.use('/auth', authRoutes);
// apiRouter.use('/dashboard', dashboardRoutes); // Futuro
// apiRouter.use('/activities', activityRoutes); // Futuro
// apiRouter.use('/users', userRoutes); // Futuro

// Monta il router principale con prefisso /api
app.use('/api', apiRouter);

// Rotta di benvenuto per l'API
app.get('/', (req, res) => {
  res.json({
    message: 'Benvenuto nell\'API di MoneyManagerApp!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      documentation: '/api/docs' // Per il futuro
    }
  });
});

// Rotta per informazioni API
app.get('/api', (req, res) => {
  res.json({
    message: 'MoneyManagerApp API',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register - Registrazione utente',
      'POST /api/auth/login - Login utente',
      'POST /api/auth/logout - Logout utente',
      'GET /api/auth/me - Informazioni utente corrente'
    ]
  });
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
      })
    .catch(err => {
      logger.error(`Error connecting to MongoDB: ${err}`)
    });
}