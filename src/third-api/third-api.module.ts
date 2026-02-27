import { Module } from '@nestjs/common';
import { ThirdApiService } from './third-api.service';
import { ThirdApiController } from './third-api.controller';

@Module({
  controllers: [ThirdApiController],
  providers: [ThirdApiService],
})
export class ThirdApiModule {}
