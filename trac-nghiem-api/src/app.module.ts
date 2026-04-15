// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';

// Config
import { databaseConfig } from './config/database.config';
import { jwtConstants } from './config/jwt.config';

// Module hiện tại
import { ExamsModule } from './modules/exams/exams.module';
import { AppController } from './app.controller';

// Guards
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),

    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { 
        expiresIn: jwtConstants.expiresIn  
      },
    }),

    ExamsModule,
  ],
  controllers: [AppController],
  providers: [
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}