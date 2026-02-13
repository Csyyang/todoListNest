import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport'; // JWT 登录守卫（与你的登录逻辑一致）
import { TodoService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { DelTodoDto } from './dto/del-todo.dto';
import { ComplentToDoList, SearchBymonthTodoList } from './dto/todo.dto';

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
    @Request() req: { user: { userId: number } }, // 获取请求对象
    @Body() createTodoDto: CreateTodoDto,
  ) {
    // 从 JWT 解析的用户信息中获取 userId（与你登录时生成的 JWT payload 一致）
    const userId = req.user.userId;
    const data = await this.todoService.createTodayTodo(userId, createTodoDto);
    return {
      code: 200,
      message: '登录成功',
      data,
    };
  }

  /**
   * 获取当日待办任务列表接口
   * @param req 
   * @returns 
   */
  @Post('getToDayToDo')
  @UseGuards(AuthGuard('jwt'))
  async getToDayToDo(@Request() req: { user: { userId: number } }) {
    const userId = req.user.userId;
    const data = await this.todoService.getTodayTodoList(userId);
    return {
      code: 200,
      message: '登录成功',
      data,
    };
  }

  /**
   * 删除当日待办任务接口
   * @param req 
   * @param delTodoDto 
   * @returns 
   */
  @Post('delToDolist')
  @UseGuards(AuthGuard('jwt'))
  async delToDolist(
    @Request() req: { user: { userId: number } },
    @Body() delTodoDto: DelTodoDto,
  ) {
    const userId = req.user.userId;
    const data = this.todoService.softDeleteTodo(delTodoDto, userId);
    return {
      code: 200,
      message: '登录成功',
      data,
    };
  }

  @Post('completeToDoList')
  @UseGuards(AuthGuard('jwt'))
  async complentToDoList(
    @Request() req: { user: { userId: number } },
    @Body() delTodoDto: ComplentToDoList,
  ) {
    const userId = req.user.userId;

    const data = await this.todoService.completeTodo(delTodoDto, userId);

    return {
      code: 200,
      message: '操作成功',
      data,
    };
  }

  /** 根据年月获取任务详情 */
  @Post('getDetailByMonth')
  @UseGuards(AuthGuard('jwt'))
  async getDetailByMonth(
    @Request() req: { user: { userId: number } },
    @Body() searchDate: SearchBymonthTodoList
  ) {
    const userId = req.user.userId;

    const data = await this.todoService.getDetailByMonth(searchDate, userId);
    console.log(data)
    return {
      code: 200,
      message: '操作成功',
      data,
    };
  }


  @Post('countUserTodosByMonth')
  @UseGuards(AuthGuard('jwt'))
  async countUserTodosByMonth(
    @Request() req: { user: { userId: number } },
    @Body() searchDate: SearchBymonthTodoList
  ) {
    const userId = req.user.userId;

    const data = await this.todoService.countUserTodosByMonth(userId, searchDate.year, searchDate.month);
    console.log(data)
    return {
      code: 200,
      message: '操作成功',
      data,
    };
  }
}
