// src/tasks/task-checker.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from 'src/todos/entities/todo.entity';
// import { WebPushModule } from 'src/web-push/web-push.module';
import { TaskCheckerService } from './task-checker.service';
import { EmailPushModule } from 'src/email-push/email-push.module';
import { TaskCheckerController } from './task-checker.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([Todo]), // 注册 Todo 实体
    // WebPushModule, // 导入 Web Push 模块（用于推送通知）
    EmailPushModule,
  ],
  controllers: [TaskCheckerController],
  providers: [TaskCheckerService],
  exports: [TaskCheckerService], // 可选：导出服务供其他模块调用
})
export class TaskCheckerModule { }