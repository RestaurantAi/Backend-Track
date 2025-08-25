import { Test, TestingModule } from '@nestjs/testing';
import { StockControlServiceController } from './stock-control-service.controller';
import { StockControlServiceService } from './stock-control-service.service';

describe('StockControlServiceController', () => {
  let stockControlServiceController: StockControlServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [StockControlServiceController],
      providers: [StockControlServiceService],
    }).compile();

    stockControlServiceController = app.get<StockControlServiceController>(StockControlServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(stockControlServiceController.getHello()).toBe('Hello World!');
    });
  });
});
