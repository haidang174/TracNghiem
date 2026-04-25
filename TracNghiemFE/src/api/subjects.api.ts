//src/api/subjects.api.ts
import { data } from "react-router-dom";
import client from "./client";

export const getSubjects = () => client.get("/subjects");

export const createSubjectApi = (data: { name: string })=>client.post("/subjects", data);   

export const updateSubjectApi = (id: number, data: { name: string })=>client.put(`/subjects/${id}`, data);

export const deleteSubjectApi = (id: number) => client.delete(`/subjects/${id}`);