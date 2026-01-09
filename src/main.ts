import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      // 禁用白名单外的属性（比如请求体传了多余的"age"字段，会被自动剔除）
      whitelist: true,
      // 非白名单属性抛错（可选：严格模式，传多余字段直接报错）
      forbidNonWhitelisted: true,
      // 将请求体转换为DTO类实例（确保类型转换，比如字符串数字转数字）
      transform: true,
      // 禁用跳过缺失属性（确保必填字段必须传）
      skipMissingProperties: false,
      // 启用错误信息（方便调试）
      disableErrorMessages: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
