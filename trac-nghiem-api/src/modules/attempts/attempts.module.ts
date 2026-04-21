//src/modules/attempts/attempts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attempt } from './entities/attempt.entity';
import { AttemptAnswer } from './entities/attempt-answer.entity';
import { AttemptsService } from './attempts.service';
import { AttemptsController } from './attempts.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Attempt, AttemptAnswer])],
  controllers: [AttemptsController],
  providers: [AttemptsService],
  exports: [AttemptsService], // ResultsModule cần
})
export class AttemptsModule {}
