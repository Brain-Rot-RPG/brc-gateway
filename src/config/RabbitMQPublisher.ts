import type { Channel, ChannelModel } from 'amqplib';
import amqp from 'amqplib';

export class RabbitMQPublisher {
    private static instance: RabbitMQPublisher;

    // Utilisation des types EXACTS de ta définition
    private connectionModel?: ChannelModel;
    private channel?: Channel;
    private readonly queue = 'brc_logs_queue';

    private constructor() {}

    public static getInstance(): RabbitMQPublisher {
        if (!RabbitMQPublisher.instance) {
            RabbitMQPublisher.instance = new RabbitMQPublisher();
        }
        return RabbitMQPublisher.instance;
    }

    async connect(uri: string): Promise<void> {
        try {
            // 1. connect() renvoie un ChannelModel d'après ta lib
            this.connectionModel = await amqp.connect(uri);

            // 2. Vérification (Type Guard) pour TS2532
            if (!this.connectionModel) {
                throw new Error('Could not establish connection model');
            }

            // 3. C'est bien ChannelModel qui a .createChannel()
            this.channel = await this.connectionModel.createChannel();

            // 4. Vérification du channel pour TS2532
            if (!this.channel) {
                throw new Error('Could not create channel');
            }

            // 5. assertQueue est bien dans l'interface Channel
            await this.channel.assertQueue(this.queue, { durable: true });

            console.log('✅ Gateway connected to RabbitMQ');
        } catch (error) {
            console.error('❌ RabbitMQ Connection Error:', error);
            throw error;
        }
    }

    public publish(log: any): void {
        // Check de sécurité pour le runtime et TS
        if (!this.channel) {
            console.error('❌ Cannot publish: Channel not initialized');
            return;
        }

        const payload = JSON.stringify({
            ...log,
            timestamp: log.timestamp || new Date().toISOString(),
            service: 'brc-gateway'
        });

        // On transforme la string en Buffer comme demandé par .sendToQueue
        this.channel.sendToQueue(this.queue, Buffer.from(payload), {
            persistent: true
        });
    }
}

export const rabbitMQPublisher = RabbitMQPublisher.getInstance();