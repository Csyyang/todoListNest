// src/tasks/task-checker.controller.ts
import { Controller, Get } from '@nestjs/common';
import { TaskCheckerService } from './task-checker.service';

@Controller('tasks/checker')
export class TaskCheckerController {
  constructor(private readonly taskCheckerService: TaskCheckerService) {}

  /**
   * 手动触发超时任务检测
   * 访问地址：GET http://localhost:3000/tasks/checker/manual-check
   */
  @Get('manual-check')
  async manualCheck() {
    return await this.taskCheckerService.manualCheck();
  }
}