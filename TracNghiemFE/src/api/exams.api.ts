//src/api/exams.api.ts
/* eslint-disable @typescript-eslint/no-empty-object-type */
import client from "./client";
import type { Answer } from "./questions.api";

export interface Exam {
  id: number;
  title: string;
  subject_id: number;
  subject_name?: string;
  duration: number;
  question_count: number;
  variant_count: number;
  created_at: string;
  questions?: ExamQuestion[];
}

export interface ExamVariant {
  id: number;
  exam_id: number;
  variant_code: string;
  created_at: string;
}

export interface ExamQuestion {
  id: number;
  content: string;
  answers: Answer[];
}

export interface CreateExamRequest {
  title: string;
  subject_id: number;
  duration: number;
  question_count: number;
  variant_count: number;
}

export interface UpdateExamRequest extends Partial<CreateExamRequest> {}

export interface ExamListResponse {
  data: {
    data: Exam[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface ExamDetailResponse {
  data: Exam;
}

export const getExams = (params?: { page?: number; limit?: number; search?: string }): Promise<ExamListResponse> => {
  return client.get("/exams", { params });
};

export const getExamById = (id: number): Promise<ExamDetailResponse> => {
  return client.get(`/exams/${id}`);
};

export const createExam = (data: CreateExamRequest): Promise<Exam> => {
  return client.post("/exams", data);
};

export const updateExam = (id: number, data: UpdateExamRequest): Promise<Exam> => {
  return client.put(`/exams/${id}`, data);
};

export const deleteExam = (id: number): Promise<void> => {
  return client.delete(`/exams/${id}`);
};

export const getExamVariants = (examId: number): Promise<ExamVariant[]> => {
  return client.get(`/exams/${examId}/variants`);
};

export const generateVariants = (examId: number): Promise<ExamVariant[]> => {
  return client.post(`/exams/${examId}/generate-variants`);
};

export const getVariantQuestions = (examId: number, variantId: number): Promise<ExamQuestion[]> => {
  return client.get(`/exams/${examId}/variants/${variantId}/questions`);
};
