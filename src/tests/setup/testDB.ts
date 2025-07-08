import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

export const setupTestDB = async () => {
  try {
    // Crea un'istanza di MongoDB in memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connetti mongoose al database in memoria
    await mongoose.connect(mongoUri);
    
    console.log('Test database connesso:', mongoUri);
  } catch (error) {
    console.error('Errore durante il setup del database di test:', error);
    throw error;
  }
};

export const teardownTestDB = async () => {
  try {
    // Disconnetti mongoose
    await mongoose.disconnect();
    
    // Ferma il server MongoDB in memoria
    if (mongoServer) {
      await mongoServer.stop();
    }
    
    console.log('Test database disconnesso');
  } catch (error) {
    console.error('Errore durante il teardown del database di test:', error);
    throw error;
  }
};

export const clearTestDB = async () => {
  try {
    // Pulisci tutte le collezioni
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('Database di test pulito');
  } catch (error) {
    console.error('Errore durante la pulizia del database di test:', error);
    throw error;
  }
};
