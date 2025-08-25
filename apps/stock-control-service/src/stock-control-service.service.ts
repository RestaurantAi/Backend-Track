import { Injectable } from '@nestjs/common';

@Injectable()
export class StockControlServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
