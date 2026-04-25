//src/api/questions.api.ts
/* eslint-disable @typescript-eslint/no-empty-object-type */
import client from "./client";

export interface Answer {
  id?: number;
  content: string;
  is_correct: boolean;
}

export interface Question {
  id: number;
  content: string;
  subject_id: number;
  subject_name: string;
  answers: Answer[];
  created_at: string;
}

export interface CreateQuestionRequest {
  content: string;
  subject_id: number;
  answers: Answer[];
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {}

export interface QuestionListResponse {
  data: {
    data: Question[];
    total: number;
    page: number;
    limit: number;
  };
}

export const getQuestions = (params?: { page?: number; limit?: number; search?: string; subject_id?: number }): Promise<QuestionListResponse> => {
  return client.get("/questions", { params });
};

export const createQuestion = (data: CreateQuestionRequest): Promise<Question> => {
  return client.post("/questions", data);
};

export const updateQuestion = (id: number, data: UpdateQuestionRequest): Promise<Question> => {
  return client.put(`/questions/${id}`, data);
};

export const deleteQuestion = (id: number): Promise<void> => {
  return client.delete(`/questions/${id}`);
};
