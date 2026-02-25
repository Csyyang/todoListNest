import { PartialType } from '@nestjs/mapped-types';
import { CreateWebPushDto } from './create-web-push.dto';

export class UpdateWebPushDto extends PartialType(CreateWebPushDto) {}
