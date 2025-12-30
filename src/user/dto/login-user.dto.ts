import { IsMobilePhone, IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * 登录请求DTO
 * 校验手机号和密码的合法性
 */
export class LoginUserDto {
  /**
   * 用户手机号
   * 必填、11位、符合中国大陆手机号格式
   */
  @IsNotEmpty({ message: '手机号不能为空' })
  @IsMobilePhone('zh-CN', {}, { message: '请输入合法的中国大陆手机号' })
  @Length(11, 11, { message: '手机号必须为11位' })
  phone: string;

  /**
   * 用户密码
   * 必填、字符串类型（前端传递明文，后端与哈希密码比对）
   */
  @IsNotEmpty({ message: '密码不能为空' })
  @IsString({ message: '密码必须为字符串类型' })
  password: string;
}