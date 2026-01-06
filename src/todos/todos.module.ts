import { Module } from '@nestjs/common';
import { TodoService } from './todos.service';
import { TodoController } from './todos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Todo])
  ],
  controllers: [TodoController],
  providers: [TodoService],
})
export class TodosModule { }
