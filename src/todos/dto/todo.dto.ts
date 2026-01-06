import { IsInt, IsNotEmpty, } from 'class-validator';

/**
 * 创建待办任务的入参 DTO
 * 用于校验前端传递的参数合法性
 */
export class ComplentToDoList {
    /**
     * 任务内容
     * 非空、字符串类型、最大长度 255
     */
    @IsNotEmpty({ message: '任务id不能为空' })
    @IsInt({ message: '任务内容必须是整数类型' })
    id: number;
}