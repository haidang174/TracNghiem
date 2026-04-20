//src/modules/questions/dto/question-response.dto.ts

import { Question } from "../entities/question.entity";
import { Subject } from "../../subjects/entities/subject.entity";
import { Answer } from "../entities/answer.entity";

export class QuestionResponseDto {
    id: number;
    content: string
    subject: Subject;
    answers: Answer[];
}