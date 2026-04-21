//src/modules/sessions/dto/session-response.dto.ts
export class SessionStudentResponseDto {
  id: number;
  student_id: number;
  student_name: string;
  email: string;
}

export class SessionResponseDto {
  id: number;
  exam_id: number;
  exam_title: string;
  title: string;
  duration: number;
  end_time: Date;
  status: string;
  created_by: number;
  created_at: Date;
  student_count?: number;
}
