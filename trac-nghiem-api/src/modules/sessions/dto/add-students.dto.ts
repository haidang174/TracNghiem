//src/modules/sessions/dto/add-students.dto.ts
import { IsArray, ArrayNotEmpty, IsNumber } from 'class-validator';

export class AddStudentsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsNumber({}, { each: true })
  student_ids: number[];
}
