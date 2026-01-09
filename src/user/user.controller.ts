import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('users') // 接口前缀：/api/users（若全局配置了 /api 前缀）
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 新增用户接口（注册接口）
   * 请求方式：POST
   * 请求路径：/users（完整路径：http://localhost:3000/users 或 http://localhost:3000/api/users）
   * 请求体：{ "phone": "13800138000", "password": "123456", "nickname": "测试用户" }
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.create(createUserDto);
    return {
      code: 200,
      message: '用户创建成功',
      data: result,
    };
  }

  /**
   * 用户登录接口
   * 请求方式：POST
   * 请求路径：/users/login（完整地址：http://localhost:3000/users/login）
   * 请求体：{ "phone": "13800138000", "password": "123456aA" }
   */
  @Post('login') // 路由后缀：login，完整接口路径 /users/login
  async login(@Body() loginUserDto: LoginUserDto) {
    console.log(loginUserDto);
    const result = await this.userService.login(loginUserDto);
    return {
      code: 200,
      message: '登录成功',
      data: result,
    };
  }
}
