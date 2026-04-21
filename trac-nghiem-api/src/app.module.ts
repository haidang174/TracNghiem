import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { databaseConfig } from './config/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { QuestionsModule } from './modules/questions/questions.module';
import { SubjectsModule } from './modules/subjects/subjects.module';

import { ExamsModule } from './modules/exams/exams.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { AttemptsModule } from './modules/attempts/attempts.module';
import { ResultsModule } from './modules/results/results.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),

    AuthModule,
    UsersModule,
    QuestionsModule,
    SubjectsModule,
    ExamsModule,
    SessionsModule,
    AttemptsModule,
    ResultsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
