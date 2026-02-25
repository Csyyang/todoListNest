import { Test, TestingModule } from '@nestjs/testing';
import { TaskCheckerService } from './task-checker.service';

describe('TaskCheckerService', () => {
  let service: TaskCheckerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskCheckerService],
    }).compile();

    service = module.get<TaskCheckerService>(TaskCheckerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
