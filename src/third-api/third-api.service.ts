import { Injectable } from '@nestjs/common';
import { weatherDto } from './dto/weather.dto'

@Injectable()
export class ThirdApiService {
  async getWeather(weatherDto: weatherDto) {
    const key = '0aaebeb44e5d1ff74e323590b4fd5921';
    // 调用高德地理逆定位接口
    const { longitude, latitude } = weatherDto;
    let res
    try {
      res = await fetch(`https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${longitude.toFixed(6)},${latitude.toFixed(6)}`);
    }
    catch (error) {
      throw new Error('获取天气信息失败');
    }
    const data = await res.json();
    if (data.status !== '1') {
      throw new Error('获取位置信息失败');
    }
    const addressComponent = data.regeocode.addressComponent;
    let weatherRes
    try {
      weatherRes = await fetch(`https://restapi.amap.com/v3/weather/weatherInfo?key=${key}&city=${addressComponent.adcode}`);

    } catch (error) {
      throw new Error('获取天气信息失败');
    }
    const weatherData = await weatherRes.json();
    if (weatherData.status !== '1') {
      throw new Error('获取天气信息失败');
    }
    return weatherData.lives[0];
  }
}
