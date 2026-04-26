//src/api/results.api.ts
import client from "./client";

export interface SessionResult {
  student_id: number;
  username: string;
  full_name: string;
  attempt_id: number;
  score: number;
  total_questions: number;
  correct_count: number;
  duration_seconds: number;
  submitted_at: string;
}

export interface AttemptResult {
  id: number;
  student_id: number;
  full_name: string;
  session_id: number;
  session_title: string;
  exam_title: string;
  score: number;
  total_questions: number;
  correct_count: number;
  duration_seconds: number;
  submitted_at: string;
  answers: {
    question_id: number;
    question_content: string;
    selected_answer_id: number;
    selected_answer_content: string;
    correct_answer_id: number;
    correct_answer_content: string;
    is_correct: boolean;
  }[];
}

export interface SessionStats {
  total_students: number;
  submitted_count: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  distribution: {
    range: string;
    count: number;
  }[];
}

export interface StudentAttempt {
  attempt_id: number;
  session_id: number;
  session_title: string;
  exam_title: string;
  score: number;
  total_questions: number;
  correct_count: number;
  submitted_at: string;
}

export const getSessionResults = (sessionId: number): Promise<{ data: SessionResult[] }> => {
  return client.get(`/sessions/${sessionId}/results`);
};

export const getAttemptResult = (attemptId: number): Promise<AttemptResult> => {
  return client.get(`/attempts/${attemptId}/result`);
};

export const getStudentAttempts = (studentId: number): Promise<StudentAttempt[]> => {
  return client.get(`/students/${studentId}/attempts`);
};

export const getSessionStats = (sessionId: number): Promise<{ data: SessionStats }> => {
  return client.get(`/sessions/${sessionId}/stats`);
};
