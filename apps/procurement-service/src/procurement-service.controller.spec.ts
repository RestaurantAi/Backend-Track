import { Test, TestingModule } from '@nestjs/testing';
import { ProcurementServiceController } from './procurement-service.controller';
import { ProcurementServiceService } from './procurement-service.service';

describe('ProcurementServiceController', () => {
  let procurementServiceController: ProcurementServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProcurementServiceController],
      providers: [ProcurementServiceService],
    }).compile();

    procurementServiceController = app.get<ProcurementServiceController>(ProcurementServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(procurementServiceController.getHello()).toBe('Hello World!');
    });
  });
});
