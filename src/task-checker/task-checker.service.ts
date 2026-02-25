// src/tasks/task-checker.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,LessThan } from 'typeorm';
import { Todo } from 'src/todos/entities/todo.entity';
import { WebPushService } from 'src/web-push/web-push.service';

@Injectable()
export class TaskCheckerService {
  private readonly logger = new Logger(TaskCheckerService.name);

  constructor(
    @InjectRepository(Todo)
    private readonly todoRepo: Repository<Todo>,
    private readonly webPushService: WebPushService, // 注入 Web Push 服务
  ) { }

  /**
   * 定时检测超时任务（每分钟执行一次）
   * Cron 表达式：* * * * * → 每分钟执行
   * 如需调整频率：
   * - 每5分钟：*5 * * * *
   * - 每小时：0 * * * *
   * - 每天9点：0 9 * * *
   */
  @Cron('* * * * *', {
    name: 'checkTimeoutTasks', // 任务名称（便于日志排查）
    timeZone: 'Asia/Shanghai', // 时区（避免时间偏移）
  })
  async checkTimeoutTasks() {
    this.logger.log('========== 开始检测超时任务 ==========');
    const now = new Date();

    try {
      // 1. 查询符合条件的超时任务
      // 条件：未完成 + 未通知 + 截止时间 < 当前时间 + 未软删除
      const timeoutTasks = await this.todoRepo.find({
        where: {
          status: 0, // 0=未完成
          isNotified: 0, // 0=未通知
          isDeleted: 0, // 0=未删除
          deadline: LessThan(now), // 截止时间已过
        },
        relations: ['user'], // 关联查询用户信息（可选，便于日志）
      });

      if (timeoutTasks.length === 0) {
        this.logger.log('暂无未处理的超时任务');
        this.logger.log('========== 检测结束 ==========\n');
        return;
      }

      this.logger.log(`共检测到 ${timeoutTasks.length} 个超时任务`);

      // 2. 遍历超时任务，推送给对应用户
      for (const task of timeoutTasks) {
        try {
          // 构造推送消息（符合 Web Push 规范，payload < 4KB）
          const pushMessage = {
            title: '任务超时提醒',
            body: `你的任务「${task.content}」已超时，请及时处理！`,
            data: {
              taskId: task.id,
              url: `/todos/${task.id}`, // 点击通知跳转的地址
              deadline: task.deadline.toLocaleString(),
            },
          };

          // 3. 调用 Web Push 服务推送给用户
          await this.webPushService.sendToUser(task.userId, pushMessage);

          // 4. 标记任务为“已通知”（避免重复推送）
          await this.todoRepo.update(task.id, {
            isNotified: 1,
          });

          this.logger.log(`任务 [${task.id}] 已推送通知给用户 [${task.userId}]`);
        } catch (error) {
          // 单个任务推送失败，不中断其他任务
          this.logger.error(
            `任务 [${task.id}] 推送失败：${error.message}`,
            error.stack,
          );
        }
      }

      this.logger.log('========== 检测结束 ==========\n');
    } catch (error) {
      // 整体查询失败，记录错误日志
      this.logger.error('超时任务检测失败', error.stack);
    }
  }

  /**
   * 手动触发检测（用于测试/接口调用）
   */
  async manualCheck() {
    this.logger.log('手动触发超时任务检测');
    await this.checkTimeoutTasks();
    return { success: true, message: '检测已执行' };
  }
}