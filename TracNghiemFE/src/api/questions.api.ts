import client from "./client";

export const getQuestionsApi = (subject_id?: number) => {
  return client.get("/questions", {
    params: { subject_id },
  });
};

export const createQuestionApi = (data: any) =>
  client.post("/questions", data);
