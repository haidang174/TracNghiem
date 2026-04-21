//src/modules/exams/entities/variant-question.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ExamVariant } from './exam-variant.entity';
import { Question } from '../../questions/entities/question.entity';

@Entity('variant_questions')
export class VariantQuestion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  variant_id: number;

  @Column()
  question_id: number;

  @Column()
  order_index: number;

  // Relations

  @ManyToOne(() => ExamVariant, (variant) => variant.variantQuestions)
  variant: ExamVariant;

  @ManyToOne(() => Question)
  question: Question;
}
