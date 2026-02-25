// src/web-push/web-push.controller.ts
import { Body, Controller, Delete, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { WebPushService, } from './web-push.service';
import type { PushSubscriptionDto, PushMessageDto } from './web-push.service';
import { AuthGuard } from '@nestjs/passport'; // JWT 登录守卫（与你的登录逻辑一致）

@Controller('web-push')
export class WebPushController {
  constructor(private readonly webPushService: WebPushService) { }

  /**
   * 获取 VAPID 公钥（前端订阅用）
   */
  @Get('public-key')
  getPublicKey() {
    return {
      code: 200,
      message: '操作成功',
      data: {
        publicKey: this.webPushService.getVapidPublicKey(),
      }
    };
  }

  /**
   * 前端提交订阅信息
   */
  @Post('subscribe')
  @UseGuards(AuthGuard('jwt'))
  async subscribe(@Request() req: { user: { userId: number } }, @Body() subscriptionDto: PushSubscriptionDto) {
    console.log(req.user)
    const subscription = await this.webPushService.addSubscription(req.user.userId, subscriptionDto);
    return {
      code: 200,
      message: '操作成功',
      data: subscription,
    };
  }

  /**
   * 前端取消订阅
   */
  @Delete('unsubscribe')
  async unsubscribe(@Query('endpoint') endpoint: string) {
    await this.webPushService.removeSubscription(endpoint);
    return {
      success: true,
      message: '取消订阅成功',
    };
  }

  /**
   * 测试推送（给指定用户发消息）
   */
  @Post('send-to-user')
  async sendToUser(
    @Body('userId') userId: number,
    @Body('message') message: PushMessageDto,
  ) {
    await this.webPushService.sendToUser(userId, message);
    return {
      code: 200,
      success: true,
      message: `已向用户 ${userId} 发送推送通知`,
    };
  }
}