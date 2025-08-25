import { Module } from '@nestjs/common';
import { KitchenServiceController } from './kitchen-service.controller';
import { KitchenServiceService } from './kitchen-service.service';

@Module({
  imports: [],
  controllers: [KitchenServiceController],
  providers: [KitchenServiceService],
})
export class KitchenServiceModule {}
