//src/modules/attempts/entities/attempt-answer.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Attempt } from './attempt.entity';
import { Question } from '../../questions/entities/question.entity';
import { Answer } from '../../questions/entities/answer.entity';

@Entity('attempt_answers')
export class AttemptAnswer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  attempt_id: number;

  @Column()
  question_id: number;

  @Column({ name: 'answer_id', nullable: true })
  answer_id: number | null;

  @Column({ name: 'is_correct', type: 'tinyint', width: 1, nullable: true })
  is_correct: boolean | null;

  @ManyToOne(() => Attempt, (attempt) => attempt.attempt_answers)
  @JoinColumn({ name: 'attempt_id' })
  attempt: Attempt;

  @ManyToOne(() => Question)
  @JoinColumn({ name: 'question_id' })
  question: Question;

  @ManyToOne(() => Answer)
  @JoinColumn({ name: 'answer_id' })
  answer: Answer;
}
