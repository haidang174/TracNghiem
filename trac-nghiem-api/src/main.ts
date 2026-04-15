import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Loại bỏ field thừa
      forbidNonWhitelisted: true, // Báo lỗi nếu có field thừa
      transform: true,           // Tự động chuyển string sang number, boolean...
    }),
  );


  app.useGlobalInterceptors(new ResponseInterceptor());

  app.useGlobalFilters(new HttpExceptionFilter());
  
  //Cấu hình CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  await app.listen(3000);
  
}
bootstrap();
