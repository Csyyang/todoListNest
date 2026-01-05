import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { TodosModule } from './todos/todos.module';

@Module({
  imports: [
    // 配置 TypeORM 连接 MySQL
    TypeOrmModule.forRoot({
      type: 'mysql', // 数据库类型
      host: '1.14.67.118', // 数据库地址（本地开发默认 localhost）
      port: 3306, // MySQL 默认端口
      username: 'todolist2026', // 你的 MySQL 用户名（默认 root）
      password: 'chMc6WtRJpGpNTyi', // 你的 MySQL 密码（替换为自己的密码）
      database: 'todolist2026', // 数据库名（需提前在 MySQL 中创建该数据库）
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // 关联的实体（可指定路径，如 ）
      synchronize: true, // 开发环境：自动同步实体到数据表（生产环境禁用！建议用迁移命令）
      logging: true, // 开发环境：打印 SQL 语句，方便调试
      charset: 'utf8mb4', // 支持 emoji 表情的编码格式
    }),
    // 后续可注册 UserModule：TypeOrmModule.forFeature([User])
    UserModule,
    TodosModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
