import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  // 注入 User 实体的 Repository（数据库操作工具）
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * 新增用户
   * @param createUserDto 前端传递的创建用户参数
   * @returns 创建成功的用户信息（隐藏密码字段）
   */
  async create(createUserDto: CreateUserDto) {
    const { phone, password, nickname } = createUserDto;

    // 1. 校验手机号是否已存在（避免重复注册）
    const existingUser = await this.userRepository.findOne({
      where: { phone, isDeleted: 0 }, // 只查询未软删除的用户
    });
    if (existingUser) {
      throw new HttpException('该手机号已注册', HttpStatus.BAD_REQUEST);
    }

    // 2. 密码加密（bcrypt 哈希加密，10轮盐值）
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. 构造用户实体（昵称若未传递，将由 @BeforeInsert 自动生成）
    const user = this.userRepository.create({
      phone,
      password: hashedPassword, // 存储加密后的密码
      nickname: nickname || '', // 传递空字符串，触发生命周期钩子的默认值逻辑
    });

    // 4. 入库保存（自动触发 @BeforeInsert 钩子生成脱敏昵称）
    const savedUser = await this.userRepository.save(user);

    // 5. 隐藏密码敏感字段，返回安全的用户信息
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * 用户登录核心方法
   * @param loginUserDto 登录参数（手机号+密码）
   * @returns 登录成功的用户信息（隐藏密码）
   */
  async login(loginUserDto: LoginUserDto) {
    const { phone, password } = loginUserDto;
    // 1. 查询用户（原有逻辑不变）
    const user = await this.userRepository.findOne({
      where: { phone, isDeleted: 0 },
    });
    if (!user) {
      throw new HttpException('手机号未注册或用户已删除', HttpStatus.BAD_REQUEST);
    }
    // 2. 密码比对（原有逻辑不变）
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new HttpException('密码错误', HttpStatus.BAD_REQUEST);
    }
    // 3. 生成 JWT token
    const token = this.jwtService.sign({
      userId: user.id,
      phone: user.phone,
    });
    // 4. 隐藏密码，返回用户信息 + token
    const { nickname } = user;
    return {
      phone,
      nickname,
      token, // 携带 token 返回
    };
  }
}