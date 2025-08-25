import { Controller, Get } from '@nestjs/common';
import { KitchenServiceService } from './kitchen-service.service';

@Controller()
export class KitchenServiceController {
  constructor(private readonly kitchenServiceService: KitchenServiceService) {}

  @Get()
  getHello(): string {
    return this.kitchenServiceService.getHello();
  }
}
