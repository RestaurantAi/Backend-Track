import { Module } from '@nestjs/common';
import { PosServiceController } from './pos-service.controller';
import { PosServiceService } from './pos-service.service';

@Module({
  imports: [],
  controllers: [PosServiceController],
  providers: [PosServiceService],
})
export class PosServiceModule {}
