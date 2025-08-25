import { Test, TestingModule } from '@nestjs/testing';
import { AccountingServiceController } from './accounting-service.controller';
import { AccountingServiceService } from './accounting-service.service';

describe('AccountingServiceController', () => {
  let accountingServiceController: AccountingServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AccountingServiceController],
      providers: [AccountingServiceService],
    }).compile();

    accountingServiceController = app.get<AccountingServiceController>(AccountingServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(accountingServiceController.getHello()).toBe('Hello World!');
    });
  });
});
