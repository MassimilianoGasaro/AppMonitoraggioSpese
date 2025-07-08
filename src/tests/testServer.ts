import dotenv from "dotenv";

// Carica le variabili d'ambiente PRIMA di tutto
dotenv.config();

import express from "express";
import session from "express-session";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import compression from "compression";
import mongoose from "mongoose";
import logger from "../logger/logger";
import { register, login, logout } from "../controllers/authController";
import { isAuthenticated } from "../middlewares/authMiddleware";
import { setupTestDB } from "./setup/testDB";

const createTestServer = async () => {
  // Setup del database di test
  await setupTestDB();
  
  const app = express();

  app.use(cors({
    credentials: true,
  }));
  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(compression());

  const secret_ses: string | undefined = process.env.SESSION_SECRET?.toString();
  // Configura la sessione
  app.use(session({
    secret: secret_ses ?? "test-secret",
    resave: true,
    saveUninitialized: true
  }));

  // Rotte
  app.get('/', (req, res) => {
    res.json({ 
      message: 'Benvenuto nell\'API di MoneyManagerApp!',
      environment: 'TEST',
      database: 'MongoDB Memory Server'
    });
  });

  app.post('/register', register);
  app.post('/login', login);
  app.post('/logout', logout);

  // Rotta protetta
  app.get('/dashboard', isAuthenticated, (req, res) => {
    res.json({ 
      message: 'Dashboard protetta',
      user: req.identity
    });
  });

  // Rotte aggiuntive per il test
  app.get('/test/users', async (req, res) => {
    const { User } = await import('../models/user');
    const users = await User.find({}).select('-password');
    res.json({ users, count: users.length });
  });

  app.delete('/test/users', async (req, res) => {
    const { User } = await import('../models/user');
    await User.deleteMany({});
    res.json({ message: 'Tutti gli utenti eliminati' });
  });

  // Middleware per gestire errori
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Errore nel server di test:', err);
    res.status(500).json({ 
      error: 'Errore interno del server',
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  return app;
};

// Avvia il server solo se questo file viene eseguito direttamente
if (require.main === module) {
  const startTestServer = async () => {
    try {
      const app = await createTestServer();
      const PORT = process.env.TEST_PORT || 3001;
      
      const server = http.createServer(app);
      
      server.listen(PORT, () => {
        console.log('🧪 TEST SERVER AVVIATO');
        console.log(`📍 URL: http://localhost:${PORT}/`);
        console.log(`💾 Database: MongoDB Memory Server`);
        console.log(`🔧 Environment: TEST`);
        console.log('');
        console.log('Rotte disponibili:');
        console.log('  GET  /                    - Homepage');
        console.log('  POST /register            - Registrazione utente');
        console.log('  POST /login               - Login utente');
        console.log('  POST /logout              - Logout utente');
        console.log('  GET  /dashboard           - Dashboard protetta');
        console.log('  GET  /test/users          - Lista utenti (solo test)');
        console.log('  DELETE /test/users        - Elimina tutti utenti (solo test)');
        console.log('');
        console.log('Per fermare il server: Ctrl+C');
      });

      // Gestione della chiusura pulita
      const gracefulShutdown = async () => {
        console.log('\n🛑 Chiusura del server di test...');
        server.close(() => {
          console.log('✅ Server chiuso');
          mongoose.disconnect().then(() => {
            console.log('✅ Database disconnesso');
            process.exit(0);
          });
        });
      };

      process.on('SIGTERM', gracefulShutdown);
      process.on('SIGINT', gracefulShutdown);

    } catch (error) {
      console.error('❌ Errore durante l\'avvio del server di test:', error);
      process.exit(1);
    }
  };

  startTestServer();
}

export { createTestServer };
