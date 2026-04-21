//src/modules/attempts/dto/submit-answer.dto.ts
import { IsNumber } from 'class-validator';

export class SubmitAnswerDto {
  @IsNumber()
  question_id: number;

  @IsNumber()
  answer_id: number;
}
