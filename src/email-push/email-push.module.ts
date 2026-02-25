// src/email-push/email-push.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailPushService } from './email-push.service';
import { EmailPushController } from './email-push.controller';
import { EmailPushConfig } from './entities/email-push.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailPushConfig]),
  ],
  controllers: [EmailPushController],
  providers: [EmailPushService],
  exports: [EmailPushService], // 导出供任务检测模块使用
})
export class EmailPushModule { }