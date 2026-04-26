//src/api/attempts.api.ts
import client from "./client";

export interface Attempt {
  id: number;
  session_id: number;
  student_id: number;
  variant_id: number;
  status: "in_progress" | "submitted";
  tab_switch_count: number;
  start_time: string;
  submitted_at?: string;
  duration_seconds: number;
  answered_count: number;
  total_count: number;
}

export interface AttemptQuestion {
  question_id: number;
  content: string;
  answers: {
    id: number;
    content: string;
  }[];
}

export const startAttempt = (sessionId: number): Promise<{ data: Attempt }> => {
  return client.post(`/sessions/${sessionId}/start`);
};

export const getAttempt = (attemptId: number): Promise<{ data: Attempt }> => {
  return client.get(`/attempts/${attemptId}`);
};

export const getAttemptQuestions = (attemptId: number): Promise<{ data: AttemptQuestion[] }> => {
  return client.get(`/attempts/${attemptId}/questions`);
};

export const submitAnswer = (attemptId: number, questionId: number, answerId: number): Promise<void> => {
  return client.post(`/attempts/${attemptId}/answer`, {
    question_id: questionId,
    answer_id: answerId
  });
};

export const submitAttempt = (attemptId: number): Promise<void> => {
  return client.post(`/attempts/${attemptId}/submit`);
};

export const recordTabSwitch = (attemptId: number): Promise<void> => {
  return client.patch(`/attempts/${attemptId}/tab-switch`);
};
