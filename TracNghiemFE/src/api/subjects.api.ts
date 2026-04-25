//src/api/subjects.api.ts
/* eslint-disable @typescript-eslint/no-empty-object-type */
import client from "./client";

export interface Subject {
  id: number;
  name: string;
}

export interface CreateSubjectRequest {
  name: string;
}

export interface UpdateSubjectRequest extends Partial<CreateSubjectRequest> {}

export interface SubjectListResponse {
  data: {
    data: Subject[];
    total: number;
    page: number;
    limit: number;
  };
}

export const getSubjects = (params?: { page?: number; limit?: number; search?: string }): Promise<SubjectListResponse> => {
  return client.get("/subjects", { params });
};

export const createSubject = (data: CreateSubjectRequest): Promise<Subject> => {
  return client.post("/subjects", data);
};

export const updateSubject = (id: number, data: UpdateSubjectRequest): Promise<Subject> => {
  return client.put(`/subjects/${id}`, data);
};

export const deleteSubject = (id: number): Promise<void> => {
  return client.delete(`/subjects/${id}`);
};
