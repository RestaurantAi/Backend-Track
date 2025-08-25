import { Injectable } from '@nestjs/common';

@Injectable()
export class PosServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
