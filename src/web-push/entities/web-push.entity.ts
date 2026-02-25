// src/web-push/entities/web-push-subscription.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';

@Entity('web_push_subscriptions')
export class WebPushSubscription {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'id',
    comment: '推送订阅记录主键ID，自增',
  })
  id: number;

  @ManyToOne(() => User, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Index()
  @Column({
    type: 'int',
    name: 'user_id',
    nullable: false,
    comment: '关联用户ID（外键，关联 user 表的 id 主键）',
  })
  userId: number;

  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 512,
    name: 'endpoint',
    nullable: false,
    comment: 'Web Push 订阅端点（浏览器推送服务地址，全局唯一）',
  })
  endpoint: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'p256dh_key',
    nullable: false,
    comment: 'Web Push 加密密钥 p256dh',
  })
  p256dhKey: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'auth_key',
    nullable: false,
    comment: 'Web Push 认证密钥 auth',
  })
  authKey: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'device_desc',
    nullable: true,
    comment: '订阅设备描述（可选，如 Chrome-PC/Safari-iOS）',
  })
  deviceDesc: string | null;

  @Column({
    type: 'tinyint',
    name: 'is_valid',
    nullable: false,
    default: 1,
    comment: '订阅有效性标记，1=有效，0=无效（推送失败时标记）',
  })
  isValid: number;

  @Column({
    type: 'tinyint',
    name: 'is_deleted',
    nullable: false,
    default: 0,
    comment: '软删除标记，0=未删除，1=已删除',
  })
  isDeleted: number;

  @CreateDateColumn({
    type: 'datetime',
    name: 'create_time',
    comment: '订阅记录创建时间，自动填充',
  })
  createTime: Date;

  @UpdateDateColumn({
    type: 'datetime',
    name: 'update_time',
    comment: '订阅记录更新时间，自动更新',
  })
  updateTime: Date;
}