//src/modules/results/results.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attempt } from '../attempts/entities/attempt.entity';
import { SessionStudent } from '../sessions/entities/session-student.entity';
import { ResultsService } from './results.service';
import { ResultsController } from './results.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Attempt, SessionStudent])],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
