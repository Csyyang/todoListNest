import { Test, TestingModule } from '@nestjs/testing';
import { EmailPushService } from './email-push.service';

describe('EmailPushService', () => {
  let service: EmailPushService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailPushService],
    }).compile();

    service = module.get<EmailPushService>(EmailPushService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
