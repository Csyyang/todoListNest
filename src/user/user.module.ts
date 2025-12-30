import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity'; // 导入User实体
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';


@Module({
  imports: [
    JwtModule.register({
      secret: 'your-secret-key', // 生产环境请使用环境变量配置，不要硬编码
      signOptions: { expiresIn: '2h' }, // token 有效期 2 小时
    }),
    TypeOrmModule.forFeature([User]) // 关键：注册User实体，自动生成UserRepository
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule { }
