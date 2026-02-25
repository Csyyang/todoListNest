// src/email-push/entities/email-push-config.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/**
 * 邮件推送配置实体
 * 存储用户的邮件接收配置（替代原 Web Push 订阅）
 */
@Entity('email_push_configs')
export class EmailPushConfig {
  /**
   * 主键 ID，自增整数
   */
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '邮件配置记录主键ID，自增',
  })
  id: number;

  /**
   * 关联用户 ID（外键）
   * 唯一索引：一个用户只能有一条邮件配置
   */
  @Index({ unique: true })
  @Column({
    type: 'int',
    name: 'user_id',
    nullable: false,
    comment: '关联用户ID（外键，关联 user 表的 id 主键）',
  })
  userId: number;

  /**
   * 用户接收提醒的邮箱地址
   */
  @Column({
    type: 'varchar',
    length: 255,
    name: 'email',
    nullable: false,
    comment: '用户接收提醒的邮箱地址',
  })
  email: string;

  /**
   * 是否开启邮件提醒
   * 1=开启，0=关闭（用户可手动关闭）
   */
  @Column({
    type: 'tinyint',
    name: 'is_enabled',
    nullable: false,
    default: 1,
    comment: '是否开启邮件提醒，1=开启，0=关闭',
  })
  isEnabled: number;

  /**
   * 软删除标记
   */
  @Column({
    type: 'tinyint',
    name: 'is_deleted',
    nullable: false,
    default: 0,
    comment: '软删除标记，0=未删除，1=已删除',
  })
  isDeleted: number;

  /**
   * 创建时间
   */
  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
    comment: '配置记录创建时间，自动填充',
  })
  createTime: Date;

  /**
   * 更新时间
   */
  @UpdateDateColumn({
    type: 'datetime',
    name: 'update_time',
    comment: '配置记录更新时间，自动更新',
  })
  updateTime: Date;
}