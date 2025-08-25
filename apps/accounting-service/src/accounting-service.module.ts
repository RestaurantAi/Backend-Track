import { Module } from '@nestjs/common';
import { AccountingServiceController } from './accounting-service.controller';
import { AccountingServiceService } from './accounting-service.service';

@Module({
  imports: [],
  controllers: [AccountingServiceController],
  providers: [AccountingServiceService],
})
export class AccountingServiceModule {}
