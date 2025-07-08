import request from 'supertest';
import express from 'express';
import { register, login } from '../../controllers/authController';
import { User } from '../../models/user';
import { clearTestDB } from '../setup/testDB';

// Setup dell'app Express per i test
const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);

describe('Auth Controller', () => {
  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario@test.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('Utente registrato con successo');

      // Verifica che l'utente sia stato creato nel database
      const user = await User.findOne({ email: userData.email });
      expect(user).not.toBeNull();
      expect(user!.name).toBe(userData.name);
      expect(user!.surname).toBe(userData.surname);
    });

    it('should return error for missing fields', async () => {
      const incompleteData = {
        name: 'Mario',
        email: 'mario@test.com'
        // Mancano surname e password
      };

      const response = await request(app)
        .post('/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Nome, cognome, password e email richiesti');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        name: 'Mario',
        surname: 'Rossi',
        email: 'duplicate@test.com',
        password: 'password123'
      };

      // Registra il primo utente
      await request(app)
        .post('/register')
        .send(userData)
        .expect(201);

      // Tentativo di registrare un utente con la stessa email
      const response = await request(app)
        .post('/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Email già esistente');
    });
  });

  describe('POST /login', () => {
    beforeEach(async () => {
      // Crea un utente di test per il login
      await User.create({
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(loginData)
        .expect(200);

      expect(response.body.message).toBe('Login riuscito');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return error for missing fields', async () => {
      const incompleteData = {
        email: 'test@example.com'
        // Manca password
      };

      const response = await request(app)
        .post('/login')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toBe('Email e password richiesti');
    });

    it('should return error for invalid credentials', async () => {
      const wrongData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/login')
        .send(wrongData)
        .expect(401);

      expect(response.body.message).toBe('Credenziali non valide');
    });

    it('should return error for non-existent user', async () => {
      const nonExistentData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/login')
        .send(nonExistentData)
        .expect(401);

      expect(response.body.message).toBe('Credenziali non valide');
    });
  });
});
