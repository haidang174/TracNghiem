//src/modules/questions/dto/create-answer.dto.ts

import { IsNotEmpty, IsBoolean } from 'class-validator';

export class CreateAnswerDto {
    @IsNotEmpty()
    content: string;
    @IsBoolean()
    isCorrect: boolean;
    @IsNotEmpty()
    questionId: number;
}