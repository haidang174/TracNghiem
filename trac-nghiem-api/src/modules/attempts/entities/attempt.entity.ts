//src/modules/attempts/entities/attempt.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ExamSession } from '../../sessions/entities/exam-session.entity';
import { User } from '../../users/entities/user.entity';
import { ExamVariant } from '../../exams/entities/exam-variant.entity';
import { AttemptAnswer } from './attempt-answer.entity';

export enum AttemptStatus {
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
}

@Entity('attempts')
export class Attempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: number;

  @Column()
  student_id: number;

  @Column({ name: 'variant_id', nullable: true })
  variant_id: number | null;

  @Column()
  attempt_number: number;

  @Column()
  start_time: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  end_time: Date | null;

  @Column({ type: 'float', nullable: true })
  score: number | null;

  @Column()
  status: AttemptStatus;

  @Column()
  tab_switch_count: number;

  @ManyToOne(() => ExamSession)
  @JoinColumn({ name: 'session_id' })
  session: ExamSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => ExamVariant)
  @JoinColumn({ name: 'variant_id' })
  variant: ExamVariant;

  @OneToMany(() => AttemptAnswer, (aa) => aa.attempt)
  attempt_answers: AttemptAnswer[];
}
