import { Injectable } from '@nestjs/common';

@Injectable()
export class ProcurementServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
