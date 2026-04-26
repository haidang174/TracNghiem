//src/api/examroom.api.ts
import client from "./client";
import type { Session } from "./sessions.api";

// Học sinh lấy danh sách phòng thi của mình
export const getMyRooms = (): Promise<Session[]> => {
  return client.get("/sessions/my");
};
