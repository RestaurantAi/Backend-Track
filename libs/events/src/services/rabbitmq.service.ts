import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.ChannelModel | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private configService: ConfigService) {
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      const url = this.configService.get('RABBITMQ_URL', 'amqp://localhost');
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Setup exchange
      await this.channel.assertExchange('restaurant.events', 'topic', {
        durable: true,
      });

      // Handle connection errors
      this.connection.on('error', (err: Error) => {
        this.logger.error('RabbitMQ connection error:', err);
      });

      this.connection.on('close', () => {
        this.logger.warn('RabbitMQ connection closed');
      });

      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
      setTimeout(() => this.connect(), 5000);
    }
  }

  async publish(routingKey: string, message: any): Promise<void> {
    if (!this.channel || !this.connection) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    try {
      const messageBuffer = Buffer.from(JSON.stringify(message));
      
      const published = this.channel.publish(
        'restaurant.events',
        routingKey,
        messageBuffer,
        { persistent: true }
      );

      if (!published) {
        this.logger.warn('Message was not published, channel write buffer is full');
      }
    } catch (error: any) {
      this.logger.error(`Failed to publish message: ${error.message}`);
      throw error;
    }
  }

  async subscribe(
    queue: string,
    routingKeys: string[],
    handler: (message: any) => Promise<void>,
  ): Promise<void> {
    if (!this.channel || !this.connection) {
      await this.connect();
    }

    if (!this.channel) {
      throw new Error('RabbitMQ channel not available');
    }

    try {
      await this.channel.assertQueue(queue, { durable: true });

      for (const routingKey of routingKeys) {
        await this.channel.bindQueue(queue, 'restaurant.events', routingKey);
      }

      await this.channel.consume(queue, async (msg: amqp.ConsumeMessage | null) => {
        if (msg && this.channel) {
          try {
            const content = JSON.parse(msg.content.toString());
            await handler(content);
            this.channel.ack(msg);
          } catch (error: any) {
            this.logger.error(`Error processing message: ${error.message}`);
            this.channel.nack(msg, false, false);
          }
        }
      });

      this.logger.log(`Subscribed to queue: ${queue} with routing keys: ${routingKeys.join(', ')}`);
    } catch (error: any) {
      this.logger.error(`Failed to subscribe to queue ${queue}: ${error.message}`);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }
      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }
      this.logger.log('RabbitMQ connections closed');
    } catch (error: any) {
      this.logger.error('Error closing RabbitMQ connections:', error);
    }
  }

  isConnected(): boolean {
    return !!(this.connection && this.channel);
  }

  async reconnect(): Promise<void> {
    this.logger.log('Attempting to reconnect to RabbitMQ...');
    await this.onModuleDestroy();
    await this.connect();
  }
}