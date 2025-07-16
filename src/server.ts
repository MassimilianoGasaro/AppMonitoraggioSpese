import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import mongoose from "mongoose";
import logger from "./logger/logger";
import authRoutes from "./routes/authRoutes";
import activitiesRoutes from "./routes/activitiesRoutes";
import config from "./config/environment";

const app = express();

// Compression per migliori performance
app.use(compression());

// CORS - Configura per production
app.use(cors({
    origin: config.frontendUrl || 'https://massimilianogasaro.github.io',
    credentials: true,
}));

// Body parsing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'MoneyManager API is running!', 
    version: '1.0.0',
    environment: config.nodeEnv,
    authentication: 'JWT',
    timestamp: new Date().toISOString()
  });
});

// routes
const apiRouter = express.Router();
app.use('/api', apiRouter);

// Aggiungi tutte le rotte al router principale
apiRouter.use('/auth', authRoutes);
apiRouter.use('/activities', activitiesRoutes); // Cambiato da /dashboard a /activities 

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  logger.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Errore interno del server',
    error: config.isDevelopment ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trovato'
  });
});

const server = http.createServer(app);

if (!config.connectionString) {
  logger.error('CONNECTION_STRING non trovata nelle variabili d\'ambiente');
  process.exit(1);
}

mongoose.connect(config.connectionString)
  .then(() => {
    logger.info("Connessione MongoDB stabilita!");
    server.listen(config.port, () => {
      logger.info(`🚀 Server in esecuzione su porta ${config.port}`);
      logger.info(`🌍 Ambiente: ${config.nodeEnv}`);
      logger.info(`🔐 Autenticazione: JWT`);
      logger.info(`📡 URL: ${config.isProduction ? 'https://your-app.onrender.com' : `http://localhost:${config.port}`}`);
    });
  })
  .catch(err => {
    logger.error(`Errore connessione MongoDB: ${err}`);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM ricevuto, chiusura graceful...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});
