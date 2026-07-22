import client from "./client";

export const getMyProgress = async () => {
  const response = await client.get("/progress");
  return response.data;
};

export const getModuleQuiz = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}/quiz`);
  return response.data;
};