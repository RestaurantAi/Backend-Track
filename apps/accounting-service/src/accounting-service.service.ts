import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
