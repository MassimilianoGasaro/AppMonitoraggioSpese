import { User } from '../../models/user';
import { clearTestDB } from '../setup/testDB';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  // Pulisci il database prima di ogni test
  beforeEach(async () => {
    await clearTestDB();
  });

  describe('User Creation', () => {
    it('should create a user with hashed password', async () => {
      const userData = {
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario.rossi@test.com',
        password: 'password123',
        dateOfSubscribe: '2025-01-01 10:00:00'
      };

      const user = await User.create(userData);

      expect(user.name).toBe(userData.name);
      expect(user.surname).toBe(userData.surname);
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Password deve essere hashata
      expect(user.dateOfSubscribe).toBe(userData.dateOfSubscribe);
      expect(user._id).toBeDefined();
    });

    it('should hash password automatically on save', async () => {
      const plainPassword = 'myPlainPassword';
      
      const user = new User({
        name: 'Test',
        surname: 'User',
        email: 'test@example.com',
        password: plainPassword
      });

      await user.save();

      // La password dovrebbe essere hashata
      expect(user.password).not.toBe(plainPassword);
      expect(user.password.length).toBeGreaterThan(20); // Hash bcrypt è lungo
      
      // Dovrebbe essere possibile verificare la password
      const isValid = await bcrypt.compare(plainPassword, user.password);
      expect(isValid).toBe(true);
    });

    it('should not allow duplicate emails', async () => {
      const userData = {
        name: 'Mario',
        surname: 'Rossi',
        email: 'duplicate@test.com',
        password: 'password123'
      };

      // Crea il primo utente
      await User.create(userData);

      // Tentativo di creare un secondo utente con la stessa email
      await expect(User.create(userData)).rejects.toThrow();
    });
  });

  describe('User Queries', () => {
    beforeEach(async () => {
      // Crea alcuni utenti di test
      await User.create({
        name: 'Mario',
        surname: 'Rossi',
        email: 'mario@test.com',
        password: 'password123'
      });

      await User.create({
        name: 'Luigi',
        surname: 'Verdi',
        email: 'luigi@test.com',
        password: 'password456'
      });
    });

    it('should find user by email', async () => {
      const user = await User.findOne({ email: 'mario@test.com' });
      
      expect(user).not.toBeNull();
      expect(user!.name).toBe('Mario');
      expect(user!.surname).toBe('Rossi');
    });

    it('should return null for non-existent email', async () => {
      const user = await User.findOne({ email: 'nonexistent@test.com' });
      expect(user).toBeNull();
    });

    it('should find user by id', async () => {
      const createdUser = await User.findOne({ email: 'mario@test.com' });
      const foundUser = await User.findById(createdUser!._id);
      
      expect(foundUser).not.toBeNull();
      expect(foundUser!.email).toBe('mario@test.com');
    });
  });

  describe('Session Token', () => {
    it('should save and retrieve user by session token', async () => {
      const sessionToken = 'test-session-token-123';
      
      const user = await User.create({
        name: 'Test',
        surname: 'User',
        email: 'session@test.com',
        password: 'password123',
        _sessionToken: sessionToken
      });

      const foundUser = await User.findOne({ _sessionToken: sessionToken });
      
      expect(foundUser).not.toBeNull();
      expect(foundUser!._id.toString()).toBe(user._id.toString());
      expect(foundUser!._sessionToken).toBe(sessionToken);
    });
  });
});
