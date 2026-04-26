//src/api/sessions.api.ts
import client from "./client";

export interface Session {
  id: number;
  title: string;
  exam_id: number;
  exam_title: string;
  duration: number;
  status: "draft" | "active" | "closed";
  created_at: string;
}

export interface SessionStudent {
  id: number;
  student_id: number;
  student_name: string;
  email: string;
}

export interface CreateSessionRequest {
  title: string;
  exam_id: number;
  duration: number;
  end_time: string;
}

export interface SessionListResponse {
  data: {
    data: Session[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface SessionStudentResponse {
  data: SessionStudent[];
}

export interface SessionByIdResponse {
  data: Session;
}

// ===== CRUD =====
export const getSessions = (params?: { page?: number; limit?: number; search?: string }): Promise<SessionListResponse> => {
  return client.get("/sessions", { params });
};

export const getSessionById = (id: number): Promise<SessionByIdResponse> => {
  return client.get(`/sessions/${id}`);
};

export const createSession = (data: CreateSessionRequest): Promise<Session> => {
  return client.post("/sessions", data);
};

export const updateSessionStatus = (id: number, status: "draft" | "active" | "closed"): Promise<Session> => {
  return client.patch(`/sessions/${id}/status`, { status });
};

// ===== STUDENTS =====
export const getSessionStudents = (sessionId: number): Promise<SessionStudentResponse> => {
  return client.get(`/sessions/${sessionId}/students`);
};

export const addStudentToSession = (sessionId: number, userId: number): Promise<unknown> => {
  return client.post(`/sessions/${sessionId}/students`, { student_ids: [userId] });
};

export const removeStudentFromSession = (sessionId: number, studentId: number): Promise<void> => {
  return client.delete(`/sessions/${sessionId}/students/${studentId}`);
};
