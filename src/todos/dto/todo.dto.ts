import { IsInt, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

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



export class SearchBymonthTodoList {
    @IsNotEmpty({ message: '查询年份不能为空' })
    @IsInt({ message: '请输入数字' })
    year: number
    @IsNotEmpty({ message: '查询月份不能为空' })
    @IsInt({ message: '请输入数字' })
    month: number

    @IsOptional()
    @IsInt({ message: '请输入数字' })
    @IsIn([0, 1], { message: '类型只能是0（未完成）或1（已完成）' })
    type?: number | undefined
}