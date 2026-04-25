//src/modules/exams/dto/exam-response.dto.ts
export class VariantResponseDto {
  id: number;
  variant_code: string;
}

export class AnswerResponseDto {
  id: number;
  content: string;
}

export class VariantQuestionResponseDto {
  order_index: number;
  question_id: number;
  content: string;
  answers: AnswerResponseDto[];
}

export class ExamResponseDto {
  id: number;
  title: string;
  subject_id: number;
  subject_name: string;
  duration: number;
  question_count: number;
  variant_count: number;
  created_by: number;
  created_at: Date;
  variants?: VariantResponseDto[];
}
