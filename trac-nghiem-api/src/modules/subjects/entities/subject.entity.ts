//src/modules/subjects/entities/subject.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity("subjects ")
export class Subject {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
}