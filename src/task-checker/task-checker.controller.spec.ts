import { Test, TestingModule } from '@nestjs/testing';
import { TaskCheckerController } from './task-checker.controller';
import { TaskCheckerService } from './task-checker.service';

describe('TaskCheckerController', () => {
  let controller: TaskCheckerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskCheckerController],
      providers: [TaskCheckerService],
    }).compile();

    controller = module.get<TaskCheckerController>(TaskCheckerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
