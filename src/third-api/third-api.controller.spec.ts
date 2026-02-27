import { Test, TestingModule } from '@nestjs/testing';
import { ThirdApiController } from './third-api.controller';
import { ThirdApiService } from './third-api.service';

describe('ThirdApiController', () => {
  let controller: ThirdApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThirdApiController],
      providers: [ThirdApiService],
    }).compile();

    controller = module.get<ThirdApiController>(ThirdApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
