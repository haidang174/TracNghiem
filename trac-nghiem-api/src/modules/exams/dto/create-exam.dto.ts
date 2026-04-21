//src/modules/exams/dto/create-exam.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
} from 'class-validator';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsPositive()
  subject_id: number;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsNumber()
  @Min(1)
  question_count: number;

  @IsNumber()
  @Min(1)
  variant_count: number;

  // created_by sẽ lấy từ JWT token, không nhận từ request body
}
