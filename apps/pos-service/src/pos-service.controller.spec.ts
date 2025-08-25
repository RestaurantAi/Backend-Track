import { Test, TestingModule } from '@nestjs/testing';
import { PosServiceController } from './pos-service.controller';
import { PosServiceService } from './pos-service.service';

describe('PosServiceController', () => {
  let posServiceController: PosServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PosServiceController],
      providers: [PosServiceService],
    }).compile();

    posServiceController = app.get<PosServiceController>(PosServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(posServiceController.getHello()).toBe('Hello World!');
    });
  });
});
