// src/email-push/email-push.controller.ts
import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { EmailPushService } from './email-push.service';
import type { EmailConfigDto, EmailMessageDto } from './email-push.service';

@Controller('email-push')
export class EmailPushController {
  constructor(private readonly emailPushService: EmailPushService) { }

  /**
   * 保存/更新用户邮件配置
   */
  @Post('config')
  async saveConfig(@Body() configDto: EmailConfigDto) {
    const config = await this.emailPushService.saveEmailConfig(configDto);
    return {
      code: 200,
      success: true,
      message: '邮件配置保存成功',
      data: config,
    };
  }

  /**
   * 获取用户邮件配置
   */
  @Get('config')
  async getConfig(@Query('userId') userId: number) {
    const config = await this.emailPushService.getValidEmailConfigByUserId(userId);
    return {
      code: 200,
      success: true,
      data: config || null,
    };
  }

  /**
   * 测试发送邮件
   */
  @Post('send-to-user')
  async sendToUser(
    @Body('userId') userId: number,
    @Body('message') message: EmailMessageDto,
  ) {
    const isSuccess = await this.emailPushService.sendToUser(userId, message);
    return {
      code: 200,
      success: isSuccess,
      message: isSuccess ? '邮件发送成功' : '邮件发送失败',
    };
  }
}