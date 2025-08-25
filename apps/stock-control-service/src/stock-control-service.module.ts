import { Module } from '@nestjs/common';
import { StockControlServiceController } from './stock-control-service.controller';
import { StockControlServiceService } from './stock-control-service.service';

@Module({
  imports: [],
  controllers: [StockControlServiceController],
  providers: [StockControlServiceService],
})
export class StockControlServiceModule {}
