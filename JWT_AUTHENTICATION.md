# Autenticazione JWT - MoneyManager API

## Panoramica

L'API MoneyManager utilizza l'autenticazione JWT (JSON Web Token) per proteggere le route. Questo significa che il client deve ottenere un token al momento del login e inviarlo con ogni richiesta alle route protette.

## Come Funziona

### 1. Login e Ottenimento del Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Risposta di successo:**
```json
{
  "success": true,
  "message": "Login effettuato con successo",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d0fe4f5311236168a109ca",
      "email": "user@example.com",
      "name": "Mario",
      "surname": "Rossi"
    },
    "expiresIn": "24h"
  }
}
```

### 2. Utilizzo del Token nelle Richieste

Per tutte le route protette, il client deve inviare il token nell'header `Authorization`:

```http
GET /api/activities/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Route Disponibili

#### Route Pubbliche (non richiedono autenticazione):
- `POST /api/auth/register` - Registrazione nuovo utente
- `POST /api/auth/login` - Login e ottenimento token

#### Route Protette (richiedono JWT token):
- `POST /api/auth/logout` - Logout utente
- `GET /api/auth/me` - Informazioni utente corrente
- `GET /api/auth/test` - Test endpoint protetto

#### Route Attività (tutte protette):
- `GET /api/activities` - Ottieni tutte le attività (solo admin)
- `GET /api/activities/user` - Ottieni attività dell'utente autenticato
- `POST /api/activities` - Crea nuova attività
- `PUT /api/activities/:id` - Aggiorna attività (solo proprie)
- `DELETE /api/activities/:id` - Elimina attività (solo proprie)

## Sicurezza e Best Practices

### Lato Client:

1. **Salva il token in modo sicuro** (localStorage, sessionStorage, o memoria)
2. **Includi sempre il token** nelle richieste alle route protette
3. **Gestisci la scadenza** del token (24 ore di default)
4. **Rimuovi il token** al logout

### Esempi di Implementazione JavaScript:

```javascript
// Salva il token dopo il login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const loginData = await loginResponse.json();
if (loginData.success) {
  localStorage.setItem('token', loginData.data.token);
}

// Usa il token per richieste protette
const token = localStorage.getItem('token');

const activitiesResponse = await fetch('/api/activities/user', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Crea una nuova attività
const newActivity = await fetch('/api/activities', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Spesa supermercato',
    amount: -45.50,
    description: 'Spesa settimanale',
    date: '2025-01-10',
    type: 'expense'
  })
});
```

## Gestione Errori

### Token Mancante (401):
```json
{
  "success": false,
  "message": "Token di accesso richiesto"
}
```

### Token Scaduto (401):
```json
{
  "success": false,
  "message": "Token scaduto"
}
```

### Token Non Valido (401):
```json
{
  "success": false,
  "message": "Token non valido"
}
```

### Accesso Negato (403):
```json
{
  "success": false,
  "message": "Non puoi modificare attività di altri utenti"
}
```

## Middleware di Autenticazione

Il sistema utilizza il middleware `isAuthenticated` che:

1. Estrae il token dall'header `Authorization`
2. Verifica la validità del token
3. Controlla che l'utente esista ancora nel database
4. Aggiunge i dati dell'utente all'oggetto `req.user`

## Vantaggi del JWT

- **Stateless**: Non richiede archiviazione server-side
- **Sicuro**: Token firmato e con scadenza
- **Scalabile**: Funziona bene con architetture distribuite
- **Standard**: Supportato da tutti i client moderni
- **Self-contained**: Contiene tutte le informazioni necessarie

## Note Importanti

- I token hanno una durata di **24 ore**
- Gli utenti possono accedere solo alle proprie attività
- Il token viene automaticamente invalidato al logout
- Non inviare mai il token in parametri URL o query string
- Utilizza sempre HTTPS in produzione
