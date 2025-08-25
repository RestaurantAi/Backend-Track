import { Controller, Get } from '@nestjs/common';
import { ProcurementServiceService } from './procurement-service.service';

@Controller()
export class ProcurementServiceController {
  constructor(private readonly procurementServiceService: ProcurementServiceService) {}

  @Get()
  getHello(): string {
    return this.procurementServiceService.getHello();
  }
}
