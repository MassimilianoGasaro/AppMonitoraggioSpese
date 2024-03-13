import winston from 'winston';

// Definisci i trasporti (destinazioni) dei log
const logger = winston.createLogger({
  level: 'info', // Livello minimo di log
  format: winston.format.json(), // Formato dei log
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }), // Log degli errori su file 'error.log'
    new winston.transports.File({ filename: 'combined.log' }) // Log di tutti i livelli su file 'combined.log'
  ]
});

// Se non sei in ambiente di produzione, aggiungi il trasporto per loggare su console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple() // Formato dei log su console
  }));
}

export default logger;