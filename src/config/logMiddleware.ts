import type { NextFunction,Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import { rabbitMQPublisher } from './RabbitMQPublisher';

export const logMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const traceId = (req.headers['x-trace-id'] as string) || uuidv4();
    const startTime = Date.now();

    // On injecte le traceId dans les headers pour que les microservices le reçoivent
    req.headers['x-trace-id'] = traceId;

    // On écoute l'événement 'finish' pour loguer après que le proxy a répondu
    res.on('finish', () => {
        const duration = Date.now() - startTime;

        const logData = {
            level: res.statusCode >= 500 ? 'FATAL' : res.statusCode >= 400 ? 'ERROR' : 'INFO',
            message: `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
            traceId,
            payload: {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                remoteAddress: req.socket.remoteAddress,
                // On évite de loguer les bodies trop volumineux ou sensibles si nécessaire
                requestBody: req.body,
            }
        };

        rabbitMQPublisher.publish(logData);
    });

    next();
};