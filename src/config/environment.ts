import dotenv from 'dotenv';
import path from 'path';

// Carica il file .env generico
dotenv.config();

// Determina l'ambiente
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configura dotenv per l'ambiente specifico
const envFile = NODE_ENV === 'production' ? '.env.production' : 
               NODE_ENV === 'test' ? '.env.test' : 
               '.env.development';

// Carica il file specifico per l'ambiente
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

// Configurazione per l'ambiente
export const config = {
  // Ambiente
  nodeEnv: NODE_ENV,
  port: parseInt(process.env.PORT || '3000', 10),
  
  // Database
  connectionString: process.env.CONNECTION_STRING,
  
  // Security
  jwtSecret: process.env.JWT_SECRET,
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL,
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Flags per l'ambiente
  isProduction: NODE_ENV === 'production',
  isDevelopment: NODE_ENV === 'development',
  isTest: NODE_ENV === 'test',
  
  // CORS
  corsOrigins: NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://massimilianogasaro.github.io']
    : ['http://localhost:3000', 'http://localhost:3001']
};

// Validazione delle variabili obbligatorie
const requiredEnvVars = ['CONNECTION_STRING', 'JWT_SECRET'];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});

export default config;
