//src/modules/subjects/dto/create-subject.dto.ts

import { IsNotEmpty, IsString, IsEmail, MinLength, IsEnum } from 'class-validator';


export class CreateSubjectDto {
    @IsNotEmpty()
    @IsString()
    name: string;
}
