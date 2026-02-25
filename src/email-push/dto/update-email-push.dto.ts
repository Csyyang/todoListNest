import { PartialType } from '@nestjs/mapped-types';
import { CreateEmailPushDto } from './create-email-push.dto';

export class UpdateEmailPushDto extends PartialType(CreateEmailPushDto) {}
