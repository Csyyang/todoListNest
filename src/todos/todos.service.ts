import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, UpdateResult } from 'typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { DelTodoDto } from './dto/del-todo.dto';
import { ComplentToDoList } from './dto/todo.dto';

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
      throw new HttpException(
        '创建当日任务失败',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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

  /**
   * 获取当前登录用户的当日待办任务列表（完全适配你的实体）
   * @param userId 当前登录用户 ID
   * @returns 当日待办列表（按创建时间降序）
   */
  async getTodayTodoList(userId: number) {
    try {
      // 1. 计算当日时间范围（UTC 时间适配数据库的 datetime 字段）
      const today = new Date();
      const startOfDay = new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          0,
          0,
          0,
          0, // 当日 00:00:00 UTC
        ),
      );
      const endOfDay = new Date(
        Date.UTC(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          23,
          59,
          59,
          999, // 当日 23:59:59 UTC
        ),
      );

      // 2. 查询当日待办（完全匹配实体字段）
      const todoList = await this.todoRepository.find({
        where: {
          status: 0,
          userId, // 匹配实体的 userId 物理字段
          isDeleted: 0, // 匹配实体的软删除标记
          createTime: Between(startOfDay, endOfDay), // 匹配实体的 createTime 字段
        },
        order: {
          createTime: 'DESC', // 按创建时间降序
          id: 'ASC', // 兜底排序（可选）
        },
        // 🌟 可选：关联查询用户信息（如需返回用户名等，开启下面配置）
        // relations: ['user'], // 关联 User 实体，可通过 todo.user 获取用户信息
        // select: { // 按需筛选关联字段，避免返回敏感信息
        //   user: { id: true, phone: true, username: true },
        // },
      });

      return todoList.map((todo) => this.formatTodoResponse(todo));
    } catch (error) {
      throw new HttpException(
        `获取当日待办列表失败：${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 软删除待办任务（核心新增方法）
   * @param todoId 要删除的任务ID
   * @param userId 当前登录用户ID（确保只能删除自己的任务）
   * @returns 软删除操作结果
   */
  async softDeleteTodo(delTodoDto: DelTodoDto, userId: number) {
    const { id: todoId } = delTodoDto;
    try {
      // 2. 查询目标任务：校验是否存在、是否归属当前用户、是否已被删除
      const targetTodo = await this.todoRepository.findOne({
        where: {
          id: todoId,
          userId: userId, // 关键：仅查询当前用户的任务，防止越权删除
        },
      });

      // 3. 业务规则校验
      if (!targetTodo) {
        throw new HttpException(
          '未找到该任务（或该任务不属于当前用户）',
          HttpStatus.NOT_FOUND,
        );
      }
      if (targetTodo.isDeleted === 1) {
        throw new HttpException(
          '该任务已被删除，无需重复操作',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. 执行软删除更新：仅修改isDeleted和updateTime（updateTime会自动更新）
      const updateResult: UpdateResult = await this.todoRepository.update(
        { id: todoId, userId: userId }, // 双重条件：确保更新的是目标任务+当前用户的任务
        { isDeleted: 1 }, // 软删除标记置为1
      );

      // 5. 校验更新结果
      if (updateResult.affected === 0) {
        throw new HttpException(
          '软删除任务失败',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // 6. 返回操作结果（可按需返回任务信息）
      return {
        success: true,
        message: '任务软删除成功',
        todoId: todoId,
        // 可选：返回删除后的任务简要信息
        todoInfo: this.formatTodoResponse({ ...targetTodo, isDeleted: 1 }),
      };
    } catch (error) {
      // 区分业务异常和系统异常，返回对应状态码
      if (error instanceof HttpException) {
        throw error; // 抛出已定义的业务异常（如任务不存在、已删除）
      }
      throw new HttpException(
        `软删除任务失败：${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 标记待办任务为已完成（核心新增方法）
   * @param todoId 要完成的任务ID
   * @param userId 当前登录用户ID（确保只能操作自己的任务）
   * @returns 完成操作结果
   */
  async completeTodo(complentToDoList: ComplentToDoList, userId: number) {
    const { id: todoId } = complentToDoList;

    try {
      // 2. 查询目标任务：校验存在性、归属、未删除
      const targetTodo = await this.todoRepository.findOne({
        where: {
          id: todoId,
          userId: userId, // 仅查询当前用户的任务，防越权
          isDeleted: 0, // 排除已软删除的任务
        },
      });

      // 3. 业务规则校验
      if (!targetTodo) {
        throw new HttpException(
          '未找到该任务（或该任务不属于当前用户/已被删除）',
          HttpStatus.NOT_FOUND,
        );
      }
      if (targetTodo.status === 1) {
        throw new HttpException(
          '该任务已完成，无需重复操作',
          HttpStatus.BAD_REQUEST,
        );
      }

      // 4. 执行完成操作：更新状态+完成时间（updateTime自动更新）
      const updateResult: UpdateResult = await this.todoRepository.update(
        { id: todoId, userId: userId }, // 双重条件，确保更新的是目标任务+当前用户的任务
        {
          status: 1, // 标记为已完成（匹配实体定义：1=已完成）
          finishTime: new Date(), // 填充完成时间为当前时间（UTC时间，适配实体datetime类型）
        },
      );

      // 5. 校验更新结果
      if (updateResult.affected === 0) {
        throw new HttpException(
          '标记任务为已完成失败',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      // 6. 返回更新后的任务信息
      const updatedTodo = {
        ...targetTodo,
        status: 1,
        finishTime: new Date(),
        updateTime: new Date(), // 同步展示更新时间（实际数据库中由UpdateDateColumn自动更新）
      };

      return {
        success: true,
        message: '任务标记为已完成成功',
        todoId,
        todoInfo: this.formatTodoResponse(updatedTodo),
      };
    } catch (error) {
      // 区分业务异常和系统异常
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        `标记任务完成失败：${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * 统一格式化响应（严格匹配实体字段）
   */
  private formatTodoResponse(todo: Todo) {
    return {
      id: todo.id,
      userId: todo.userId,
      content: todo.content,
      status: todo.status, // 0=未完成，1=已完成（匹配实体定义）
      createTime: todo.createTime,
      updateTime: todo.updateTime,
      finishTime: todo.finishTime,
      // isDeleted: todo.isDeleted, // 可选返回，根据业务需求决定
      // 若开启了 relations: ['user']，可补充用户信息：
      // userName: todo.user?.username,
      // userPhone: todo.user?.phone,
    };
  }
}
