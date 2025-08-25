import { Controller, Get } from '@nestjs/common';
import { PosServiceService } from './pos-service.service';

@Controller()
export class PosServiceController {
  constructor(private readonly posServiceService: PosServiceService) {}

  @Get()
  getHello(): string {
    return this.posServiceService.getHello();
  }
}
