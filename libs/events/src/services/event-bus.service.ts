import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RabbitMQService } from './rabbitmq.service';

export interface BusinessEvent {
  eventType: string;
  organizationId: string;
  userId?: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
}

@Injectable()
export class EventBusService {
  private readonly logger = new Logger(EventBusService.name);

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly rabbitMQ: RabbitMQService,
  ) {}

  async publishEvent(event: BusinessEvent): Promise<void> {
    try {
      // Emit locally for immediate handling
      this.eventEmitter.emit(event.eventType, event);

      // Publish to RabbitMQ for cross-service communication
      await this.rabbitMQ.publish(event.eventType, event);

      this.logger.log(`Published event: ${event.eventType}`, {
        organizationId: event.organizationId,
        correlationId: event.correlationId,
      });
    } catch (error) {
      this.logger.error(`Failed to publish event: ${event.eventType}`, error);
      throw error;
    }
  }

  onEvent(eventType: string, handler: (event: BusinessEvent) => Promise<void>) {
    this.eventEmitter.on(eventType, handler);
  }
}