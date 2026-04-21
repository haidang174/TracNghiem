//src/modules/exams/entities/exam-variant.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Exam } from './exam.entity';
import { VariantQuestion } from './variant-question.entity';

@Entity('exam_variants')
export class ExamVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exam_id: number;

  @Column({ length: 10 })
  variant_code: string;

  // Relations

  @ManyToOne(() => Exam, (exam) => exam.variants)
  exam: Exam;

  @OneToMany(() => VariantQuestion, (vq) => vq.variant)
  variantQuestions: VariantQuestion[];
}
