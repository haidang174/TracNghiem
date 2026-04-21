//src/modules/sessions/sessions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamSession } from './entities/exam-session.entity';
import { SessionStudent } from './entities/session-student.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExamSession, SessionStudent])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService], // AttemptsModule cần
})
export class SessionsModule {}
