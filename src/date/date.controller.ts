import { Controller, Get } from '@nestjs/common';
import { DateService } from './date.service';
@Controller('date')
export class DateController {
  constructor(private readonly dateService: DateService) { }

  @Get('current')
  getCurrent() {
    return {
      code: 200,
      message: 'success',
      data: this.dateService.getCurrent(),
    };
  }
}
