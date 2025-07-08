import { setupTestDB, teardownTestDB } from './testDB';

// Setup globale prima di tutti i test
beforeAll(async () => {
  await setupTestDB();
});

// Cleanup globale dopo tutti i test
afterAll(async () => {
  await teardownTestDB();
});
