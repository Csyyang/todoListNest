import { Module } from '@nestjs/common';
import { TodoService } from './todos.service';
import { TodoController } from './todos.controller';

@Module({
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodosModule {}
