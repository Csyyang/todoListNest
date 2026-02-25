// src/tasks/task-checker.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Todo } from 'src/todos/entities/todo.entity';
// 替换为 EmailPushService
import { EmailPushService } from 'src/email-push/email-push.service';

@Injectable()
export class TaskCheckerService {
  private readonly logger = new Logger(TaskCheckerService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
    // 注入邮件推送服务
    private readonly emailPushService: EmailPushService,
  ) {}

  /**
   * 定时检测超时任务（每分钟执行一次）
   */
  @Cron('* * * * *', {
    name: 'checkTimeoutTasks',
    timeZone: 'Asia/Shanghai',
  })
  async checkTimeoutTasks() {
    this.logger.log('========== 开始检测超时任务 ==========');
    const now = new Date();

    try {
      // 查询超时任务（原有逻辑不变）
      const timeoutTasks = await this.todoRepo.find({
        where: {
          status: 0,
          isNotified: 0,
          isDeleted: 0,
          deadline: LessThan(now),
        },
      });

      if (timeoutTasks.length === 0) {
        this.logger.log('暂无未处理的超时任务');
        this.logger.log('========== 检测结束 ==========\n');
        return;
      }

      this.logger.log(`共检测到 ${timeoutTasks.length} 个超时任务`);

      // 遍历发送邮件
      for (const task of timeoutTasks) {
        try {
          // 构造邮件消息
          const emailMessage = {
            subject: '【Todo任务管理】任务超时提醒',
            template: 'timeout-task', // 对应模板文件 timeout-task.hbs
            context: {
              title: '任务超时提醒',
              content: `你的任务「${task.content}」已超时，请及时处理！`,
              taskId: task.id,
              deadline: task.deadline.toLocaleString(),
              currentTime: now.toLocaleString(),
            },
          };

          // 发送邮件
          const isSuccess = await this.emailPushService.sendToUser(task.userId, emailMessage);

          // 标记为已通知（无论是否发送成功，避免重复检测）
          await this.todoRepo.update(task.id, {
            isNotified: 1,
          });

          if (isSuccess) {
            this.logger.log(`任务 [${task.id}] 已发送提醒邮件给用户 [${task.userId}]`);
          } else {
            this.logger.warn(`任务 [${task.id}] 邮件发送失败，已标记为已通知`);
          }
        } catch (error) {
          this.logger.error(`任务 [${task.id}] 处理失败：${error.message}`, error.stack);
        }
      }

      this.logger.log('========== 检测结束 ==========\n');
    } catch (error) {
      this.logger.error('超时任务检测失败', error.stack);
    }
  }

  /**
   * 手动触发检测
   */
  async manualCheck() {
    this.logger.log('手动触发超时任务检测');
    await this.checkTimeoutTasks();
    return { success: true, message: '检测已执行' };
  }
}