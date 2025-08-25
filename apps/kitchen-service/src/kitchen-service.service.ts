import { Injectable } from '@nestjs/common';

@Injectable()
export class KitchenServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
