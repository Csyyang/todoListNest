// src/email-push/email-push.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailPushConfig } from './entities/email-push.entity';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

// 邮件消息类型
export interface EmailMessageDto {
  subject: string; // 邮件标题
  template: string; // 模板名称（如 timeout-task）
  context: Record<string, any>; // 模板上下文数据
}

// 用户邮件配置 DTO
export interface EmailConfigDto {
  userId: number;
  email: string;
  isEnabled?: number;
}

@Injectable()
export class EmailPushService {
  private readonly logger = new Logger(EmailPushService.name);
  private transporter: nodemailer.Transporter; // 邮件发送器
  private templateDir: string; // 邮件模板目录

  constructor(
    @InjectRepository(EmailPushConfig)
    private readonly emailConfigRepo: Repository<EmailPushConfig>,
    private readonly configService: ConfigService,
  ) {
    // 初始化邮件发送器（从环境变量读取配置）
    this.initTransporter();
    // 初始化模板目录
    this.templateDir = path.join(process.cwd(), 'src/email-push/templates');
    // 创建模板目录（如果不存在）
    if (!fs.existsSync(this.templateDir)) {
      fs.mkdirSync(this.templateDir, { recursive: true });
    }
  }

  /**
   * 初始化邮件发送器（支持 SMTP 协议）
   */
  private initTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('EMAIL_SMTP_HOST'), // 如 smtp.qq.com
      port: this.configService.get<number>('EMAIL_SMTP_PORT'), // 如 465
      secure: this.configService.get<boolean>('EMAIL_SMTP_SECURE') || true, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_SMTP_USER'), // 发件人邮箱
        pass: this.configService.get<string>('EMAIL_SMTP_PASS'), // 邮箱授权码（非登录密码）
      },
    };

    // 校验配置
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      this.logger.error('邮件 SMTP 配置未完善！请检查 .env 文件');
      return;
    }

    // 创建发送器
    this.transporter = nodemailer.createTransport(smtpConfig);

    // 测试连接（可选）
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error(`邮件服务器连接失败：${error.message}`);
      } else {
        this.logger.log('邮件服务器连接成功，可正常发送邮件');
      }
    });
  }

  /**
   * 添加/更新用户邮件配置
   */
  async saveEmailConfig(configDto: EmailConfigDto): Promise<EmailPushConfig> {
    try {
      // 先查询用户是否已有配置
      let config = await this.emailConfigRepo.findOne({
        where: { userId: configDto.userId, isDeleted: 0 },
      });

      if (config) {
        // 更新现有配置
        config.email = configDto.email;
        config.isEnabled = configDto.isEnabled ?? config.isEnabled;
      } else {
        // 创建新配置
        config = this.emailConfigRepo.create({
          userId: configDto.userId,
          email: configDto.email,
          isEnabled: configDto.isEnabled ?? 1,
          isDeleted: 0,
        });
      }

      const savedConfig = await this.emailConfigRepo.save(config);
      this.logger.log(`用户 ${configDto.userId} 邮件配置保存成功，邮箱：${configDto.email}`);
      return savedConfig;
    } catch (error) {
      this.logger.error(`保存邮件配置失败：${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * 根据用户ID获取有效邮件配置
   */
  async getValidEmailConfigByUserId(userId: number): Promise<EmailPushConfig | null> {
    return this.emailConfigRepo.findOne({
      where: {
        userId,
        isEnabled: 1,
        isDeleted: 0,
      },
    });
  }

  /**
   * 渲染邮件模板
   */
  private async renderTemplate(templateName: string, context: Record<string, any>): Promise<string> {
    try {
      // 模板文件路径（如 timeout-task.hbs）
      const templatePath = path.join(this.templateDir, `${templateName}.hbs`);

      // 如果模板文件不存在，创建默认模板
      if (!fs.existsSync(templatePath)) {
        const defaultTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>{{subject}}</title>
          </head>
          <body>
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <h2>{{title}}</h2>
              <p>{{content}}</p>
              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                此邮件为系统自动发送，请勿回复
              </p>
            </div>
          </body>
          </html>
        `;
        fs.writeFileSync(templatePath, defaultTemplate, 'utf8');
        this.logger.warn(`模板 ${templateName} 不存在，已创建默认模板`);
      }

      // 读取并编译模板
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const compiledTemplate = handlebars.compile(templateContent);
      return compiledTemplate(context);
    } catch (error) {
      this.logger.error(`渲染模板失败：${error.message}`, error.stack);
      // 返回纯文本兜底
      return `<h1>${context.title}</h1><p>${context.content}</p>`;
    }
  }

  /**
   * 给指定用户发送邮件
   */
  async sendToUser(userId: number, message: EmailMessageDto): Promise<boolean> {
    // 1. 校验发送器是否初始化
    if (!this.transporter) {
      this.logger.error('邮件发送器未初始化，发送失败');
      return false;
    }

    // 2. 获取用户有效邮件配置
    const config = await this.getValidEmailConfigByUserId(userId);
    if (!config) {
      this.logger.warn(`用户 ${userId} 暂无有效邮件配置，跳过发送`);
      return false;
    }

    try {
      // 3. 渲染邮件模板
      const html = await this.renderTemplate(message.template, message.context);

      // 4. 构造邮件选项
      const mailOptions = {
        from: `"Todo任务管理" <${this.configService.get<string>('EMAIL_SMTP_USER')}>`, // 发件人
        to: config.email, // 收件人
        subject: message.subject, // 邮件标题
        html, // HTML 内容
      };

      // 5. 发送邮件
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(`邮件发送成功，用户 ${userId}，邮箱 ${config.email}，Message-ID: ${result.messageId}`);
      return true;
    } catch (error) {
      this.logger.error(`给用户 ${userId} 发送邮件失败：${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 关闭邮件发送器（应用关闭时调用）
   */
  async close() {
    if (this.transporter) {
      await this.transporter.close();
      this.logger.log('邮件发送器已关闭');
    }
  }
}