//src/modules/sessions/dto/create-session.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  Min,
  IsNumber,
} from 'class-validator';

export class CreateSessionDto {
  @IsNumber()
  exam_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsDateString()
  end_time: string;
}
