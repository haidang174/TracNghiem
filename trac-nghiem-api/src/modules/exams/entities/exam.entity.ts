//src/modules/exams/entities/exam.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Subject } from '../../subjects/entities/subject.entity';
import { User } from '../../users/entities/user.entity';
import { ExamVariant } from './exam-variant.entity';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column()
  subject_id: number;

  @Column()
  duration: number;

  @Column()
  question_count: number;

  @Column()
  variant_count: number;

  @Column()
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  // Relations

  @ManyToOne(() => Subject)
  @JoinColumn({ name: 'subject_id' })
  subject: Subject;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => ExamVariant, (variant) => variant.exam)
  variants: ExamVariant[];
}
