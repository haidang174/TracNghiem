//src/modules/subjects/dto/create-subject.dto.ts
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
