import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
// 导入 User 实体，建立关联依赖
import { User } from 'src/user/entities/user.entity';

@Entity('todos')
export class Todo {
    /**
     * 任务主键 ID，自增整数
     */
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
        comment: '任务主键ID，自增'
    })
    id: number;

    /**
     * 关联用户 ID（显式外键，与 User 表主键关联）
     * @ManyToOne：多对一关联（多个 Todo 对应一个 User）
     * @JoinColumn：指定关联的外键字段，生成数据库外键约束
     */
    @ManyToOne(() => User, (user) => user.todos, {
        // 可选配置：用户删除时，关联的任务是否同步处理
        // onDelete: 'CASCADE', // 级联删除：用户删除，任务也随之删除
        // onDelete: 'SET NULL', // 用户删除，任务的 userId 设为 null（需将 nullable 改为 true）
        onDelete: 'RESTRICT', // 默认值：禁止删除存在关联任务的用户（更安全）
        nullable: false
    })
    @JoinColumn({ name: 'user_id' }) // 对应数据库字段 user_id，与 User 表的 id 关联
    user: User; // 实体关联属性：可直接通过 todo.user 获取关联的用户信息

    /**
     * 外键字段（物理存储字段），与 @JoinColumn 中的 name 对应
     */
    @Column({
        type: 'int',
        name: 'user_id',
        nullable: false,
        comment: '关联用户ID（外键，关联 user 表的 id 主键）'
    })
    userId: number;

    /**
     * 任务内容，非空
     */
    @Column({
        type: 'varchar',
        length: 255,
        name: 'content',
        nullable: false,
        comment: '任务核心内容描述'
    })
    content: string;

    /**
     * 任务创建时间，自动填充
     */
    @CreateDateColumn({
        type: 'datetime',
        name: 'create_time',
        comment: '任务创建时间，自动填充'
    })
    createTime: Date;

    /**
     * 任务修改时间，自动更新
     */
    @UpdateDateColumn({
        type: 'datetime',
        name: 'update_time',
        comment: '任务信息更新时间，自动更新'
    })
    updateTime: Date;

    /**
     * 任务完成日期，可选字段（未完成时为 null）
     */
    @Column({
        type: 'datetime',
        name: 'finish_time',
        nullable: true,
        comment: '任务完成时间，任务完成时填充，未完成则为null'
    })
    finishTime: Date | null;

    /**
     * 软删除标记，与 User 表保持一致
     */
    @Column({
        type: 'tinyint',
        name: 'is_deleted',
        nullable: false,
        default: 0,
        comment: '软删除标记，0=未删除，1=已删除'
    })
    isDeleted: number;

    /**
     * 任务状态（可选，增强业务实用性）
     */
    @Column({
        type: 'tinyint',
        name: 'status',
        nullable: false,
        default: 0, // 0：未完成，1：已完成
        comment: '任务状态，0=未完成，1=已完成'
    })
    status: number;
}