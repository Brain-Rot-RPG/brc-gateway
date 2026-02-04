import app from './app';
import config from './config/config';
import {rabbitMQPublisher} from './config/RabbitMQPublisher';

async function startServer() {
    try {
    // 1. Initialisation de RabbitMQ
        console.log('⏳ Connecting to RabbitMQ...');
        await rabbitMQPublisher.connect(process.env.RABBITMQ_URI || 'amqp://localhost');

        // 2. Lancement d'Express
        app.listen(config.port, () => {
            console.log(`\n🚀 Gateway "Brain Rot" running on port ${config.port}`);
            console.log('📋 Routing table ready.');
        });
    } catch (error) {
        console.error('❌ Critical failure during gateway bootstrap:', error);
        process.exit(1);
    }
}

startServer();