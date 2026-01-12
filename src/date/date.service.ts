import { Injectable } from '@nestjs/common';
import { CreateDateDto } from './dto/create-date.dto';
import { UpdateDateDto } from './dto/update-date.dto';

// 枚举
enum WeekDays {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
}

@Injectable()
export class DateService {
  getCurrent() {
    // 1. 创建当前日期实例
    const now = new Date();

    const currentWeekday = now.getDay()
    const currentDate = now.getDate();

    return {
      weekday: currentWeekday,
      date: currentDate
    };
  }
}
