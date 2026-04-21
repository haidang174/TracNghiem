//src/modules/exams/dto/exam-response.dto.ts
export class VariantResponseDto {
  id: number;
  variant_code: string;
}

export class ExamResponseDto {
  id: number;
  title: string;
  subject_id: number;
  duration: number;
  question_count: number;
  variant_count: number;
  created_by: number;
  created_at: Date;
  variants?: VariantResponseDto[];
}
