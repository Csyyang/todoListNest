import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtService } from '@nestjs/jwt';
// import { ConfigService } from '@nestjs/config'; // 可选：若用配置文件管理密钥，否则直接写死密钥

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 注入 JWT 服务和配置服务（若有）
  constructor(
    private readonly jwtService: JwtService,
    // private readonly configService: ConfigService, // 可选：用配置文件时添加
  ) {
    super({
      // 从请求头的 `Authorization: Bearer {token}` 中提取 JWT
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 不忽略 token 过期（过期则直接抛出异常）
      ignoreExpiration: false,
      // 🌟 关键：JWT 密钥必须和你登录时生成 token 的密钥一致！
      // 方式1：直接写死（和你登录时 jwtService.sign 用的密钥一致）
      secretOrKey: 'your-secret-key', // 替换成你登录逻辑中实际的密钥（比如 'nest-todolist-secret'）
      // 方式2：从配置文件读取（推荐，更规范）
      // secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  /**
   * JWT 验证通过后执行的逻辑
   * @param payload JWT 解码后的载荷（就是你登录时 sign 的 { userId, phone }）
   * @returns 挂载到 req.user 上的用户信息（后续接口可通过 req.user 获取）
   */
  async validate(payload: any) {
    // 验证 payload 是否包含必要的用户信息（防止伪造 token）
    if (!payload.userId || !payload.phone) {
      throw new UnauthorizedException('Token 无效，缺少用户信息');
    }
    // 返回的内容会自动挂载到 req.user 上（对应 Todo 接口中 req.user.userId）
    return {
      userId: payload.userId,
      phone: payload.phone,
    };
  }
}