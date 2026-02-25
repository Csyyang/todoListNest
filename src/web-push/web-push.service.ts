// src/web-push/web-push.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as webpush from 'web-push';
import { ConfigService } from '@nestjs/config';
import { WebPushSubscription } from './entities/web-push.entity';

// 前端传递的订阅数据类型
export interface PushSubscriptionDto {
  userId: number;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceDesc?: string;
}

// 推送消息内容类型
export interface PushMessageDto {
  title: string;
  body: string;
  data?: Record<string, any>;
}

@Injectable()
export class WebPushService {
  private readonly logger = new Logger(WebPushService.name);

  constructor(
    @InjectRepository(WebPushSubscription)
    private readonly subscriptionRepo: Repository<WebPushSubscription>,
    private readonly configService: ConfigService,
  ) {
    // 初始化 Web Push VAPID 配置
    const vapidKeys = {
      publicKey: this.configService.get<string>('VAPID_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('VAPID_PRIVATE_KEY'),
    };

    if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
      this.logger.error('VAPID 密钥未配置！请在 .env 中设置 VAPID_PUBLIC_KEY 和 VAPID_PRIVATE_KEY');
      return;
    }

    webpush.setVapidDetails(
      'mailto:693765678@qq.com', // 替换为你的邮箱
      vapidKeys.publicKey,
      vapidKeys.privateKey,
    );
  }

  /**
   * 添加用户订阅（持久化到数据库）
   */
  async addSubscription(userId: number, subscriptionDto: PushSubscriptionDto): Promise<WebPushSubscription> {
    // 先删除同 endpoint 的旧订阅（避免重复）
    await this.subscriptionRepo.delete({ endpoint: subscriptionDto.endpoint });

    console.log('okkokoko')

    // 创建新订阅记录
    const subscription = this.subscriptionRepo.create({
      userId: userId,
      endpoint: subscriptionDto.endpoint,
      p256dhKey: subscriptionDto.keys.p256dh,
      authKey: subscriptionDto.keys.auth,
      deviceDesc: subscriptionDto.deviceDesc || null,
      isValid: 1,
      isDeleted: 0,
    });

    const saved = await this.subscriptionRepo.save(subscription);
    this.logger.log(`用户 ${userId} 订阅成功，endpoint: ${subscriptionDto.endpoint}`);
    return saved;
  }

  /**
   * 移除用户订阅
   */
  async removeSubscription(endpoint: string): Promise<void> {
    await this.subscriptionRepo.delete({ endpoint });
    this.logger.log(`订阅已移除，endpoint: ${endpoint}`);
  }

  /**
   * 标记订阅为无效（推送失败时调用）
   */
  async markSubscriptionInvalid(endpoint: string): Promise<void> {
    await this.subscriptionRepo.update({ endpoint }, { isValid: 0 });
    this.logger.log(`订阅标记为无效，endpoint: ${endpoint}`);
  }

  /**
   * 根据用户ID获取有效订阅
   */
  async getValidSubscriptionsByUserId(userId: number): Promise<WebPushSubscription[]> {
    return this.subscriptionRepo.find({
      where: {
        userId,
        isValid: 1,
        isDeleted: 0,
      },
    });
  }

  /**
   * 给指定用户发送推送通知
   */
  async sendToUser(userId: number, message: PushMessageDto): Promise<void> {
    // 获取用户所有有效订阅
    const subscriptions = await this.getValidSubscriptionsByUserId(userId);
    if (subscriptions.length === 0) {
      this.logger.warn(`用户 ${userId} 暂无有效订阅，跳过推送`);
      return;
    }

    // 批量推送
    const promises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dhKey,
              auth: sub.authKey,
            },
          },
          JSON.stringify(message),
        );
        this.logger.log(`推送给用户 ${userId} 成功，endpoint: ${sub.endpoint}`);
      } catch (error) {
        this.logger.error(`推送给用户 ${userId} 失败: ${error.message}`, error.stack);
        // 订阅过期/无效，标记为无效
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.markSubscriptionInvalid(sub.endpoint);
        }
      }
    });

    await Promise.all(promises);
  }

  /**
   * 获取 VAPID 公钥（给前端使用）
   */
  getVapidPublicKey(): string {
    return this.configService.get<string>('VAPID_PUBLIC_KEY') || '';
  }
}