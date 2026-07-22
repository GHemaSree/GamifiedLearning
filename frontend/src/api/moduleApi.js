import client from "./client";

export const getModuleById = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}`);
  return response.data;
};

export const getModuleQuiz = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}/quiz`);
  return response.data;
};