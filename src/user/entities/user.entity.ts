import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Todo } from 'src/todos/entities/todo.entity';

@Entity('users') // 显式指定数据表名（可选，默认是 user 复数 users）
export class User {
    /**
     * 主键 ID，自增整数
     */
    @PrimaryGeneratedColumn({
        type: 'int',
        name: 'id',
        comment: '用户主键ID，自增'
    })
    id: number;

    /**
     * 手机号，唯一非空，用于登录标识
     */
    @Column({
        type: 'varchar',
        length: 11,
        name: 'phone',
        unique: true, // 手机号唯一，避免重复注册
        nullable: false, // 不允许为空
        comment: '用户手机号，唯一，用于登录'
    })
    phone: string;

    /**
     * 密码，存储 bcrypt 加密后的哈希值，非空
     */
    @Column({
        type: 'varchar',
        length: 255, // 足够存储 bcrypt 哈希后的密码（哈希后长度固定，255 留有余量）
        name: 'password',
        nullable: false,
        comment: '用户密码（bcrypt 加密后的哈希值，非明文）'
    })
    password: string;

    /**
     * 昵称，非空，可自定义，默认可设为手机号前缀
     */
    @Column({
        type: 'varchar',
        length: 50,
        name: 'nickname',
        nullable: false,
        comment: '用户昵称，默认手机号脱敏显示'
    })
    nickname: string;

    /**
     * 用户创建时间，自动生成
     */
    @CreateDateColumn({
        type: 'datetime',
        name: 'create_time',
        comment: '用户创建时间，自动填充'
    })
    createTime: Date;

    /**
     * 用户更新时间，自动更新
     */
    @UpdateDateColumn({
        type: 'datetime',
        name: 'update_time',
        comment: '用户信息更新时间，自动更新'
    })
    updateTime: Date;

    /**
     * 软删除标记（可选，推荐添加，避免物理删除数据）
     */
    @Column({
        type: 'tinyint',
        name: 'is_deleted',
        nullable: false,
        default: 0, // 0：未删除，1：已删除
        comment: '软删除标记，0=未删除，1=已删除'
    })
    isDeleted: number;


    @OneToMany(() => Todo, (todo) => todo.user)
    todos: Todo[];
}