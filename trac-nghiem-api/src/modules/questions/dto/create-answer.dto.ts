//src/modules/questions/dto/create-answer.dto.ts
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsBoolean()
  is_correct: boolean;
}
