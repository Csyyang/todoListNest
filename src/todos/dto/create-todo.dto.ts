import { IsNotEmpty, IsString, MaxLength, IsDateString } from 'class-validator';

/**
 * 创建待办任务的入参 DTO
 * 用于校验前端传递的参数合法性
 */
export class CreateTodoDto {
    /**
     * 任务内容
     * 非空、字符串类型、最大长度 255
     */
    @IsNotEmpty({ message: '任务内容不能为空' })
    @IsString({ message: '任务内容必须是字符串类型' })
    @MaxLength(255, { message: '任务内容长度不能超过 255 个字符' })
    content: string;


    @IsNotEmpty({ message: '任务截止日期不能为空' })
    @IsDateString({}, { message: '截止日期格式错误，请传入 ISO 8601 格式的日期字符串（如：2024-02-15 18:00:00）' })
    deadline: string;
}