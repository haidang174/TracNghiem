//src/modules/questions/dto/create-question.dto.ts

import { IsNotEmpty, IsInt, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerDto } from './create-answer.dto';
export class CreateQuestionDto {
    @IsNotEmpty()
    content: string
    @IsInt()
    subjectId: number
    @ValidateNested({ each: true })
    @Type(() => CreateAnswerDto)
    answers: CreateAnswerDto[]
}