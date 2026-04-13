import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
      port: 4000,
      username: '2k573cTqtncSS2K.root',
      password: 'p6pgN88fvWMx8uUd',
      database: 'TracNghiem',
      entities: [], // Danh sách các entity sẽ ánh xạ
      synchronize: true, // Tự động tạo bảng từ entity (trong development)
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
