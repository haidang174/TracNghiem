//src/modules/results/dto/result-response.dto.ts
export class AnswerDetailDto {
  question_id: number;
  content: string;
  selected_answer_id: number | null;
  selected_answer_content: string | null;
  correct_answer_id: number;
  correct_answer_content: string;
  is_correct: boolean;
}

export class AttemptResultDto {
  attempt_id: number;
  student_id: number;
  student_name: string;
  variant_code: string;
  score: number;
  correct_count: number;
  total_count: number;
  start_time: Date;
  end_time: Date | null;
  tab_switch_count: number;
  answers: AnswerDetailDto[];
}

export class SessionResultItemDto {
  attempt_id: number;
  student_id: number;
  student_name: string;
  variant_code: string;
  score: number | null;
  correct_count: number;
  total_count: number;
  status: string;
  tab_switch_count: number;
}

export class SessionStatsDto {
  session_id: number;
  total_students: number; // tổng số học sinh trong phòng
  submitted_count: number; // số đã nộp bài
  avg_score: number; // điểm trung bình
  highest_score: number;
  lowest_score: number;
  distribution: ScoreRangeDto[]; // phân phối điểm theo khoảng
}

export class ScoreRangeDto {
  range: string; // vd: "0-2", "2-4", "4-6", "6-8", "8-10"
  count: number;
}
