import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // JWT 登录守卫（与你的登录逻辑一致）
import { TodoService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { DelTodoDto } from './dto/del-todo.dto';
import { ComplentToDoList } from './dto/todo.dto';

@Controller('todos') // 接口前缀：/todos
export class TodoController {
  constructor(private readonly todoService: TodoService) { }

  /**
   * 创建当日待办任务接口
   * @UseGuards(AuthGuard())：保护接口，必须携带有效的 JWT token 才能访问
   * @Request() req：获取请求对象，从 req.user 中解析出当前登录用户信息（与你的 JWT 配置一致）
   * @Body() createTodoDto：接收前端传递的任务内容
   */
  @Post('today') // 接口路径：/todos/today
  @UseGuards(AuthGuard('jwt')) // 替换为你的 JWT 守卫策略名称（默认通常是 'jwt'）
  async createTodayTodo(
    @Request() req, // 获取请求对象
    @Body() createTodoDto: CreateTodoDto,
  ) {
    // 从 JWT 解析的用户信息中获取 userId（与你登录时生成的 JWT payload 一致）
    const userId = req.user.userId;
    return this.todoService.createTodayTodo(userId, createTodoDto);
  }

  @Post('getToDayToDo')
  @UseGuards(AuthGuard('jwt'))
  async getToDayToDo(
    @Request() req,
  ) {
    const userId = req.user.userId;

    return this.todoService.getTodayTodoList(userId)
  }

  @Post('delToDolist')
  @UseGuards(AuthGuard('jwt'))
  async delToDolist(
    @Request() req,
    @Body() delTodoDto: DelTodoDto
  ) {
    const userId = req.user.userId;

    return this.todoService.softDeleteTodo(delTodoDto, userId)
  }


  @Post('completeToDoList')
  @UseGuards(AuthGuard('jwt'))
  async complentToDoList(
    @Request() req,
    @Body() delTodoDto: ComplentToDoList
  ) {
    const userId = req.user.userId;

    return this.todoService.completeTodo(delTodoDto, userId)
  }
}