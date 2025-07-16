# 🔧 Configurazione Ambienti - MoneyManager API

## Panoramica

L'API supporta 3 ambienti distinti:
- **Development** (sviluppo locale)
- **Production** (deploy su Render)
- **Test** (esecuzione dei test)

## 📁 File di Configurazione

### `.env.development` (Git-ignored)
```bash
NODE_ENV=development
PORT=3000
CONNECTION_STRING=mongodb://localhost:27017/moneymanager_dev
JWT_SECRET=your-dev-jwt-secret
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=debug
```

### `.env.production` (Git-ignored)
```bash
NODE_ENV=production
PORT=10000
CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/moneymanager
JWT_SECRET=your-production-jwt-secret-minimum-32-characters
FRONTEND_URL=https://massimilianogasaro.github.io
LOG_LEVEL=info
```

### `.env.test` (Git-ignored)
```bash
NODE_ENV=test
PORT=3001
CONNECTION_STRING=mongodb://localhost:27017/moneymanager_test
JWT_SECRET=test-jwt-secret
FRONTEND_URL=http://localhost:3000
LOG_LEVEL=error
```

## 🚀 Script NPM

### Sviluppo
```bash
# Avvia in modalità development con hot reload
npm run dev

# Avvia in modalità development senza hot reload
npm run start:dev

# Testa la modalità production localmente
npm run dev:prod
```

### Produzione
```bash
# Build per produzione
npm run build

# Avvia in modalità production
npm start

# Build ottimizzato per produzione
npm run build:prod
```

### Test
```bash
# Esegui i test
npm test

# Test con watch mode
npm run test:watch

# Test con coverage
npm run test:coverage

# Avvia il server di test
npm run test:server
```

## 🔧 Come Funziona

### 1. **Selezione Ambiente**
L'ambiente viene determinato dalla variabile `NODE_ENV`:
- Se `NODE_ENV=production` → carica `.env.production`
- Se `NODE_ENV=test` → carica `.env.test`
- Altrimenti → carica `.env.development`

### 2. **Caricamento Configurazione**
```typescript
// server.ts
const NODE_ENV = process.env.NODE_ENV || 'development';
const envFile = NODE_ENV === 'production' ? '.env.production' : '.env.development';

dotenv.config(); // Carica .env generico
dotenv.config({ path: envFile }); // Carica file specifico ambiente
```

### 3. **Configurazione Centralizzata**
```typescript
// config/environment.ts
import { config } from './config/environment';

// Usa le configurazioni
app.use(cors({ origin: config.corsOrigins }));
server.listen(config.port);
```

## 🌐 Deploy su Render

### Variabili d'Ambiente da Configurare
Nel dashboard Render, aggiungi:
```bash
NODE_ENV=production
PORT=10000
CONNECTION_STRING=mongodb+srv://user:pass@cluster.mongodb.net/moneymanager
JWT_SECRET=your-super-secure-jwt-secret-minimum-32-characters
FRONTEND_URL=https://massimilianogasaro.github.io
LOG_LEVEL=info
```

### Build Command
```bash
npm ci && npm run build
```

### Start Command
```bash
NODE_ENV=production npm start
```

## 🛠️ Setup Locale

### 1. Crea i file .env
```bash
# Copia i file di esempio
cp .env.example .env.development
cp .env.example .env.production
cp .env.example .env.test

# Modifica i file con le tue configurazioni
```

### 2. Configura MongoDB locale
```bash
# Installa MongoDB localmente o usa Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# O usa MongoDB Atlas anche per development
```

### 3. Genera chiavi segrete
```bash
# Genera JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Genera session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🚨 Sicurezza

### ⚠️ **Mai committare file .env**
I file `.env.*` sono nel `.gitignore` e non devono mai essere committati.

### ✅ **Usa .env.example**
Crea un file `.env.example` con variabili di esempio (senza valori reali).

### 🔐 **Chiavi di Produzione**
- JWT_SECRET deve essere di almeno 32 caratteri
- Usa generatori di password sicuri
- Rigenera le chiavi periodicamente

## 📊 Monitoraggio

### Log Levels per Ambiente
- **Development**: `debug` (tutti i log)
- **Production**: `info` (solo log importanti)
- **Test**: `error` (solo errori)

### Health Check
Ogni ambiente ha un endpoint di health check:
```bash
GET /
```

Risposta:
```json
{
  "message": "MoneyManager API is running!",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```
