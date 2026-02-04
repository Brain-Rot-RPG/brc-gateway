import express from 'express';

import {logMiddleware} from './config/logMiddleware';
import routingSystem from './routers/routingSystem';
// import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Parser les données AVANT le logging
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
 
// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
    // Gérer les requêtes preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
  
    next();
});

// Logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
  
    // Écouter la réponse
    const originalJson = res.json;
    res.json = function(data) {
        console.log(`[${timestamp}] Response status: ${res.statusCode}`);
        console.log('Response data:', data);
        return originalJson.call(this, data);
    };
  
    next();
});

app.use(logMiddleware);

app.use('/api/v1', routingSystem.getRouter());

export default app;