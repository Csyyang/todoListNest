// src/web-push/web-push.module.ts
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebPushService } from './web-push.service';
import { WebPushController } from './web-push.controller';
import { WebPushSubscription } from './entities/web-push.entity';

// @Global() // 全局模块，其他模块可直接注入使用
@Module({
  imports: [
    TypeOrmModule.forFeature([WebPushSubscription]), // 注册实体
  ],
  controllers: [WebPushController],
  providers: [WebPushService],
  exports: [WebPushService], // 导出服务供其他模块使用
})
export class WebPushModule { }