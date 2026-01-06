import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
// import { ConfigService } from '@nestjs/config'; // 可选：用配置文件时添加

@Module({
  imports: [
    // 注册 Passport 并指定默认策略为 'jwt'（和 JwtStrategy 对应）
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // 注册 JWT 模块，配置密钥和过期时间（和你登录逻辑一致）
    JwtModule.register({
      // 🌟 同样：密钥必须和登录时一致！
      secret: 'your-secret-key', // 替换成实际密钥
      // 可选：从配置文件读取
      // secret: new ConfigService().get('JWT_SECRET'),
      // token 过期时间（和你登录时的配置一致，比如 7 天）
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [JwtStrategy], // 注册策略和配置服务（若有）
  exports: [JwtStrategy, PassportModule], // 导出供其他模块（如 TodoModule）使用
})
export class AuthModule {}