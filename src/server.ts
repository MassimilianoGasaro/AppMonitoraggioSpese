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
import activitiesRoutes from "./routes/activitiesRoutes";

dotenv.config();

const app = express();

// Compression per migliori performance
app.use(compression());

// CORS - Configura per production
app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://massimilianogasaro.github.io',
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
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 ore
    }
  })
);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MoneyManager API is running!', 
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// routes
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Aggiungi tutte le rotte al router principale
apiRouter.use('/auth', authRoutes);
apiRouter.use('/dashboard', activitiesRoutes); // Cambiato da /dashboard a /activities 

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato'
  });
});

const PORT = process.env.PORT || 3000;
const uri: string | undefined = process.env.CONNECTION_STRING;
const server = http.createServer(app);

if (!uri) {
  logger.error('CONNECTION_STRING non trovata nelle variabili d\'ambiente');
  process.exit(1);
}

if (uri) {
    mongoose.connect(uri)
    .then(() => { /** ready to use. The `mongoose.connect()` promise resolves to mongoose instance. */
      logger.info("Connessione MongoDB stabilita!");
      server.listen(PORT, () => {
        logger.info(`Server in esecuzione su porta ${PORT}`);
        logger.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`URL: ${process.env.NODE_ENV === 'production' ? 'https://your-app.onrender.com' : `http://localhost:${PORT}`}`);
      });
      }, err => { /** handle initial connection error */ 
        logger.error(`Errore connessione iniziale: ${err}`);
        process.exit(1);
      })
    .catch(err => {
      logger.error(`Error connecting to MongoDB: ${err}`)
      process.exit(1);
    });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM ricevuto, chiusura graceful...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
