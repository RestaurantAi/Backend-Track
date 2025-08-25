import { Test, TestingModule } from '@nestjs/testing';
import { KitchenServiceController } from './kitchen-service.controller';
import { KitchenServiceService } from './kitchen-service.service';

describe('KitchenServiceController', () => {
  let kitchenServiceController: KitchenServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [KitchenServiceController],
      providers: [KitchenServiceService],
    }).compile();

    kitchenServiceController = app.get<KitchenServiceController>(KitchenServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(kitchenServiceController.getHello()).toBe('Hello World!');
    });
  });
});
