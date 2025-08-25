import { Module } from '@nestjs/common';
import { ProcurementServiceController } from './procurement-service.controller';
import { ProcurementServiceService } from './procurement-service.service';

@Module({
  imports: [],
  controllers: [ProcurementServiceController],
  providers: [ProcurementServiceService],
})
export class ProcurementServiceModule {}
