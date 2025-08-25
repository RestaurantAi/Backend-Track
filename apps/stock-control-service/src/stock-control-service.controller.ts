import { Controller, Get } from '@nestjs/common';
import { StockControlServiceService } from './stock-control-service.service';

@Controller()
export class StockControlServiceController {
  constructor(private readonly stockControlServiceService: StockControlServiceService) {}

  @Get()
  getHello(): string {
    return this.stockControlServiceService.getHello();
  }
}
