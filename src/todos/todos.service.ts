import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  // 注入 Todo 仓库
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  /**
   * 创建当日待办任务
   * @param userId 当前登录用户 ID（从 JWT 令牌中解析获取）
   * @param createTodoDto 任务创建参数（任务内容）
   * @returns 创建成功的任务信息
   */
  async createTodayTodo(userId: number, createTodoDto: CreateTodoDto) {
    const { content } = createTodoDto;

    // 1. 实例化 Todo 实体（自动填充 createTime/updateTime，无需手动赋值）
    const todo = this.todoRepository.create({
      userId, // 关联当前登录用户（从 JWT 中获取，确保任务归属正确）
      content, // 任务内容
      // 以下字段无需手动赋值，使用默认值或自动填充
      // isDeleted: 0（默认值）
      // status: 0（默认值，未完成）
      // finishTime: null（默认值，未完成）
      // createTime: 自动填充当前时间（当日时间，即当日任务）
      // updateTime: 自动填充当前时间
    });

    // 2. 保存任务到数据库
    const savedTodo = await this.todoRepository.save(todo);

    if (!savedTodo) {
      throw new HttpException('创建当日任务失败', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 3. 返回创建成功的任务信息（可按需过滤字段）
    return {
      id: savedTodo.id,
      content: savedTodo.content,
      userId: savedTodo.userId,
      status: savedTodo.status,
      createTime: savedTodo.createTime,
      updateTime: savedTodo.updateTime,
      finishTime: savedTodo.finishTime,
    };
  }
}