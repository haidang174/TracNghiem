//src/modules/sessions/entities/exam-session.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Exam } from '../../exams/entities/exam.entity';
import { SessionStudent } from './session-student.entity';

export enum SessionStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  CLOSED = 'closed',
}

@Entity('exam_sessions')
export class ExamSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  exam_id: number;

  @Column()
  title: string;

  @Column()
  duration: number; // phút

  @Column()
  end_time: Date;

  @Column()
  status: SessionStatus;

  @Column()
  created_by: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => SessionStudent, (ss) => ss.session)
  sessionStudents: SessionStudent[];
}
