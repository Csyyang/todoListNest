import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskCheckerDto } from './create-task-checker.dto';

export class UpdateTaskCheckerDto extends PartialType(CreateTaskCheckerDto) {}
