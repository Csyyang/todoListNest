import { Test, TestingModule } from '@nestjs/testing';
import { EmailPushController } from './email-push.controller';
import { EmailPushService } from './email-push.service';

describe('EmailPushController', () => {
  let controller: EmailPushController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailPushController],
      providers: [EmailPushService],
    }).compile();

    controller = module.get<EmailPushController>(EmailPushController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
