//src/modules/sessions/entities/session-student.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ExamSession } from './exam-session.entity';
import { User } from '../../users/entities/user.entity';

@Entity('session_students')
export class SessionStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  session_id: number;

  @Column()
  student_id: number;

  @ManyToOne(() => ExamSession, (session) => session.sessionStudents)
  @JoinColumn({ name: 'session_id' })
  session: ExamSession;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;
}
