//src/modules/attempts/dto/attempt-response.dto.ts
// Câu hỏi trả cho student khi làm bài — KHÔNG có is_correct
export class AttemptAnswerOptionDto {
  id: number;
  content: string;
}

export class AttemptQuestionDto {
  order_index: number;
  question_id: number;
  content: string;
  answers: AttemptAnswerOptionDto[];
  selected_answer_id: number | null; // đáp án student đã chọn (nếu có)
}

export class AttemptResponseDto {
  id: number;
  session_id: number;
  variant_id: number | null;
  attempt_number: number;
  start_time: Date;
  end_time: Date | null;
  score: number | null;
  status: string;
  tab_switch_count: number;
  answered_count: number; // số câu đã trả lời
  total_count: number; // tổng số câu
  duration_seconds: number;
}
