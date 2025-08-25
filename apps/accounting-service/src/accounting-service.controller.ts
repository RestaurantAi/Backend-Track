import { Controller, Get } from '@nestjs/common';
import { AccountingServiceService } from './accounting-service.service';

@Controller()
export class AccountingServiceController {
  constructor(private readonly accountingServiceService: AccountingServiceService) {}

  @Get()
  getHello(): string {
    return this.accountingServiceService.getHello();
  }
}
