import { IsMobilePhone, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

/**
 * 创建用户的请求DTO
 * 用于校验前端传递的参数
 */
export class CreateUserDto {
    /**
     * 用户手机号
     * 必填、11位、符合手机号格式
     */
    @IsNotEmpty({ message: '手机号不能为空' })
    @IsMobilePhone('zh-CN', {}, { message: '请输入合法的中国大陆手机号' })
    @Length(11, 11, { message: '手机号必须为11位' })
    phone: string;

    /**
     * 用户密码
     * 必填、字符串类型（后续将加密存储）
     */
    @IsNotEmpty({ message: '密码不能为空' })
    @IsString({ message: '密码必须为字符串类型' })
    password: string;

    /**
     * 用户昵称
     * 可选（不传递则由 @BeforeInsert 自动生成脱敏昵称）
     */
    @IsNotEmpty({ message: '昵称不能为空' })
    @IsString({ message: '昵称必须为字符串类型' })
    @Length(1, 50, { message: '昵称长度必须在1-50位之间' })
    nickname: string;
}