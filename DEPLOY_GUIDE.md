# 🚀 Guida Deploy su Render - MoneyManager API

## Prerequisiti

### 1. Database MongoDB Atlas (GRATUITO)
Prima di deployare, hai bisogno di un database MongoDB:

1. Vai su [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Crea un account gratuito
3. Clicca "Create a New Cluster"
4. Scegli il piano **M0 Sandbox (FREE)**
5. Scegli la regione più vicina (es. Europe - Frankfurt)
6. Clicca "Create Cluster"

### 2. Configura MongoDB Atlas
1. **Database Access**:
   - Vai su "Database Access" nel menu
   - Clicca "Add New Database User"
   - Username: `moneymanager`
   - Password: genera una password sicura (salvala!)
   - Database User Privileges: "Read and write to any database"

2. **Network Access**:
   - Vai su "Network Access"
   - Clicca "Add IP Address"
   - Scegli "Allow Access from Anywhere" (0.0.0.0/0)
   - Conferma

3. **Connection String**:
   - Vai su "Clusters" → "Connect"
   - Scegli "Connect your application"
   - Copia la connection string che sarà simile a:
   ```
   mongodb+srv://moneymanager:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Sostituisci `<password>` con la password del database user
   - Aggiungi il nome del database alla fine: `/moneymanager`

### 3. Repository GitHub
Assicurati che il tuo codice sia su GitHub:
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## 🌐 Deploy su Render

### Passo 1: Registrazione
1. Vai su [render.com](https://render.com)
2. Clicca "Get Started for Free"
3. Registrati con GitHub (consigliato)

### Passo 2: Nuovo Web Service
1. Nel dashboard, clicca "New +" → "Web Service"
2. Scegli "Build and deploy from a Git repository"
3. Connetti il tuo repository GitHub
4. Seleziona il repository `MoneyManagerApp_API`

### Passo 3: Configurazione
**Settings Base:**
- **Name**: `moneymanager-api` (o il nome che preferisci)
- **Region**: Europe (West) - per l'Italia
- **Branch**: `main`
- **Root Directory**: lascia vuoto
- **Runtime**: Node
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

**Environment Variables:**
Clicca "Advanced" e aggiungi queste variabili:

```bash
NODE_ENV=production
PORT=10000
CONNECTION_STRING=mongodb+srv://moneymanager:TUA_PASSWORD@cluster0.xxxxx.mongodb.net/moneymanager?retryWrites=true&w=majority
JWT_SECRET=super-secret-jwt-key-at-least-32-characters-long-change-this
SESSION_SECRET=super-secret-session-key-at-least-32-characters-long-change-this
```

⚠️ **IMPORTANTE**: Sostituisci:
- `TUA_PASSWORD` con la password del database
- `xxxxx` con il tuo cluster ID
- Genera chiavi JWT_SECRET e SESSION_SECRET sicure

### Passo 4: Deploy
1. Clicca "Create Web Service"
2. Render inizierà il build e deploy automaticamente
3. Attendi 5-10 minuti per il primo deploy

### Passo 5: Verifica
Una volta completato il deploy:
1. Clicca sull'URL fornito (es. `https://moneymanager-api.onrender.com`)
2. Dovresti vedere:
```json
{
  "message": "MoneyManager API is running!",
  "version": "1.0.0",
  "environment": "production",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 🧪 Test delle API

### Test Login
```bash
curl -X POST https://moneymanager-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Registrazione
```bash
curl -X POST https://moneymanager-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mario",
    "surname": "Rossi",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 🔄 Auto-Deploy
Render è configurato per auto-deploy:
- Ogni `git push` sulla branch `main` triggera un nuovo deploy
- Il processo richiede 3-5 minuti
- Riceverai notifiche email sui deploy

## 📊 Monitoraggio
Nel dashboard Render puoi:
- Vedere i log in tempo reale
- Monitorare CPU/RAM usage
- Vedere metriche di performance
- Configurare alerting

## 🆓 Piano Gratuito
Il piano gratuito include:
- 750 ore/mese di compute
- HTTPS automatico
- Auto-deploy da GitHub
- Limitazioni: app va in "sleep" dopo 15 min di inattività

## 🚨 Upgrade a Pagamento ($7/mese)
Per apps in produzione, considera l'upgrade per:
- Nessun sleep mode
- Più risorse CPU/RAM
- SLA migliore
- Supporto prioritario

## 🔧 Troubleshooting

### Build Failed
Se il build fallisce:
1. Controlla i log nel dashboard
2. Verifica che `npm run build` funzioni localmente
3. Controlla che tutte le dipendenze siano in `dependencies` (non `devDependencies`)

### App Crashes
Se l'app crasha:
1. Controlla i log runtime
2. Verifica la CONNECTION_STRING
3. Controlla che tutte le env vars siano configurate

### Performance Issues
Se l'app è lenta:
1. Ottimizza le query MongoDB
2. Aggiungi caching
3. Considera l'upgrade al piano pagamento

## 📱 Utilizzo dal Frontend

Una volta deployata, puoi usare l'API dal frontend:

```javascript
// Login
const response = await fetch('https://moneymanager-api.onrender.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});

const data = await response.json();
const token = data.data.token;

// Uso delle API protette
const activitiesResponse = await fetch('https://moneymanager-api.onrender.com/api/activities/user', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 🌟 Risultato Finale

🎉 **Congratulazioni!** Hai deployato con successo la tua API con:
- ✅ HTTPS automatico
- ✅ Database MongoDB Atlas
- ✅ Auto-deploy da GitHub
- ✅ Monitoraggio integrato
- ✅ Scalabilità automatica

**URL API**: `https://your-app-name.onrender.com`
**Endpoints disponibili**: `/api/auth/*` e `/api/activities/*`
