import express from 'express';
import routingSystem from './routers/routingSystem';
// import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', routingSystem.getRouter());

// app.use(errorHandler);

export default app;