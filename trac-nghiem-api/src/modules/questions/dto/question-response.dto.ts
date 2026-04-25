//src/modules/questions/dto/question-response.dto.ts
export class AnswerResponseDto {
  id: number;
  content: string;
  is_correct: boolean; // Có is_correct — endpoint này chỉ ADMIN & TEACHER truy cập
}

export class QuestionResponseDto {
  id: number;
  subject_id: number;
  subject_name: string;
  content: string;
  created_by: number;
  created_at: Date;
  answers?: AnswerResponseDto[];
}
