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
import authRoutes from "../routes/authRoutes";

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

  // routes
  app.use('/auth', authRoutes);

  // Rotte aggiuntive per il test
  app.get('/test/users', async (req, res) => {
    const { User } = await import('../models/user');
    const users = await User.find({}).select('-password');
    res.json({ users, count: users.length });
  });

  app.get('/test/activities', async (req, res) => {
    const { Activity } = await import('../models/activity');
    const activities = await Activity.find({});
    res.json({ activities, count: activities.length });
  });

  app.get('/test/activities/user/:email', async (req, res) => {
    const { User } = await import('../models/user');
    const { Activity } = await import('../models/activity');
    
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    
    const activities = await Activity.find({ user_id: user._id });
    const totalIncome = activities.filter(a => a.type === 'entrata').reduce((sum, a) => sum + a.amount, 0);
    const totalExpenses = activities.filter(a => a.type !== 'entrata').reduce((sum, a) => sum + a.amount, 0);
    
    res.json({ 
      user: { name: user.name, surname: user.surname, email: user.email },
      activities,
      stats: {
        total: activities.length,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses
      }
    });
  });

  app.post('/test/seed-data', async (req, res) => {
    const { User } = await import('../models/user');
    const { Activity } = await import('../models/activity');
    
    const testUsers = [
      { name: 'Mario', surname: 'Rossi', email: 'mario@test.com', password: 'password123' },
      { name: 'Luigi', surname: 'Verdi', email: 'luigi@test.com', password: 'password456' },
      { name: 'Anna', surname: 'Bianchi', email: 'anna@test.com', password: 'password789' }
    ];

    // Pulisci prima
    await User.deleteMany({});
    await Activity.deleteMany({});
    
    const createdUsers = await User.create(testUsers);
    
    // Crea attività fittizie per ogni utente
    const testActivities = [
      // Attività per Mario Rossi (index 0)
      {
        name: 'Spesa al supermercato',
        amount: 75.50,
        description: 'Spesa settimanale da Conad',
        date: '2025-01-01 10:30:00',
        type: 'spesa',
        user_id: createdUsers[0]._id
      },
      {
        name: 'Benzina',
        amount: 45.00,
        description: 'Rifornimento auto',
        date: '2025-01-02 08:15:00',
        type: 'trasporti',
        user_id: createdUsers[0]._id
      },
      {
        name: 'Stipendio',
        amount: 1500.00,
        description: 'Stipendio mensile',
        date: '2025-01-01 00:00:00',
        type: 'entrata',
        user_id: createdUsers[0]._id
      },
      {
        name: 'Cena ristorante',
        amount: 35.00,
        description: 'Cena con amici alla pizzeria',
        date: '2025-01-03 20:00:00',
        type: 'svago',
        user_id: createdUsers[0]._id
      },

      // Attività per Luigi Verdi (index 1)
      {
        name: 'Affitto casa',
        amount: 650.00,
        description: 'Affitto mensile appartamento',
        date: '2025-01-01 10:00:00',
        type: 'casa',
        user_id: createdUsers[1]._id
      },
      {
        name: 'Bolletta elettrica',
        amount: 85.30,
        description: 'Bolletta ENEL bimestre nov-dic',
        date: '2025-01-02 14:20:00',
        type: 'bollette',
        user_id: createdUsers[1]._id
      },
      {
        name: 'Freelance progetto web',
        amount: 800.00,
        description: 'Pagamento per sito web cliente',
        date: '2025-01-02 16:00:00',
        type: 'entrata',
        user_id: createdUsers[1]._id
      },
      {
        name: 'Abbonamento palestra',
        amount: 25.00,
        description: 'Abbonamento mensile FitClub',
        date: '2025-01-01 12:00:00',
        type: 'salute',
        user_id: createdUsers[1]._id
      },

      // Attività per Anna Bianchi (index 2)
      {
        name: 'Spesa farmacia',
        amount: 18.50,
        description: 'Medicinali e vitamine',
        date: '2025-01-01 15:30:00',
        type: 'salute',
        user_id: createdUsers[2]._id
      },
      {
        name: 'Libro universitario',
        amount: 45.00,
        description: 'Manuale di matematica finanziaria',
        date: '2025-01-02 11:00:00',
        type: 'formazione',
        user_id: createdUsers[2]._id
      },
      {
        name: 'Borsa di studio',
        amount: 300.00,
        description: 'Borsa di studio università',
        date: '2025-01-01 09:00:00',
        type: 'entrata',
        user_id: createdUsers[2]._id
      },
      {
        name: 'Aperitivo con colleghi',
        amount: 12.00,
        description: 'Happy hour dopo lavoro',
        date: '2025-01-03 18:30:00',
        type: 'svago',
        user_id: createdUsers[2]._id
      },
      {
        name: 'Abbonamento Netflix',
        amount: 9.99,
        description: 'Abbonamento mensile streaming',
        date: '2025-01-01 20:00:00',
        type: 'svago',
        user_id: createdUsers[2]._id
      },

      // Attività aggiuntive per varietà
      {
        name: 'Tagliando auto',
        amount: 120.00,
        description: 'Revisione e cambio olio',
        date: '2025-01-04 09:00:00',
        type: 'trasporti',
        user_id: createdUsers[0]._id
      },
      {
        name: 'Spesa online',
        amount: 89.75,
        description: 'Acquisti Amazon vari',
        date: '2025-01-03 14:00:00',
        type: 'shopping',
        user_id: createdUsers[1]._id
      },
      {
        name: 'Corso di inglese',
        amount: 150.00,
        description: 'Iscrizione corso trimestrale',
        date: '2025-01-02 16:30:00',
        type: 'formazione',
        user_id: createdUsers[2]._id
      }
    ];
    
    const createdActivities = await Activity.create(testActivities);
    
    res.json({ 
      message: 'Dati di test creati con successo',
      users: createdUsers.map(u => ({ 
        id: u._id, 
        name: u.name, 
        surname: u.surname, 
        email: u.email 
      })),
      activities: {
        total: createdActivities.length,
        byUser: {
          [createdUsers[0].email]: createdActivities.filter(a => a.user_id.toString() === createdUsers[0]._id.toString()).length,
          [createdUsers[1].email]: createdActivities.filter(a => a.user_id.toString() === createdUsers[1]._id.toString()).length,
          [createdUsers[2].email]: createdActivities.filter(a => a.user_id.toString() === createdUsers[2]._id.toString()).length
        }
      }
    });
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
        console.log('  GET  /test/users/:email   - Trova utente per email');
        console.log('  DELETE /test/users        - Elimina tutti utenti (solo test)');
        console.log('  GET  /test/activities     - Lista attività (solo test)');
        console.log('  GET  /test/activities/user/:email - Attività per utente (solo test)');
        console.log('  GET  /test/db-info        - Info database (solo test)');
        console.log('  POST /test/seed-data      - Crea dati di test');
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
