//src/modules/questions/entities/answer.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Question } from './question.entity';
@Entity("answers")
export class Answer {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    questionId: number;
    @Column()
    content: string;
    @Column()
    isCorrect: boolean
    @ManyToOne(() => Question, question => question.answers)
    question: Question;
}