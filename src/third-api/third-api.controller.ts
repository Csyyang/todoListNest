import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ThirdApiService } from './third-api.service';
import { AuthGuard } from '@nestjs/passport';
import { weatherDto } from './dto/weather.dto'
@Controller('third-api')
export class ThirdApiController {
  constructor(private readonly thirdApiService: ThirdApiService) { }

  @Post('/getWeather')
  @UseGuards(AuthGuard('jwt'))
  async getWeather(
    @Body() weatherDto: weatherDto
  ) {
    const data = await this.thirdApiService.getWeather(weatherDto);

    return {
      code: 200,
      message: '操作成功',
      data,
    };
  }
}
