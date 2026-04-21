//src/modules/exams/exams.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsController } from './exams.controller';
import { ExamsService } from './exams.service';
import { Exam } from './entities/exam.entity';
import { ExamVariant } from './entities/exam-variant.entity';
import { VariantQuestion } from './entities/variant-question.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, ExamVariant, VariantQuestion])],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService, TypeOrmModule], // SessionsModule & AttemptsModule sẽ cần
})
export class ExamsModule {}
