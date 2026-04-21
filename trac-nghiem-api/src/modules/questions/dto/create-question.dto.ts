//src/modules/questions/dto/create-question.dto.ts
import {
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateAnswerDto } from './create-answer.dto';

export class CreateQuestionDto {
  @IsNumber()
  subject_id: number;

  @IsString()
  @IsNotEmpty()
  content: string;

  @ValidateNested({ each: true })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[];
}
