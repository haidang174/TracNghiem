//src/modules/questions/entities/question.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Answer } from './answer.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @Column()
  subjectId: number;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
