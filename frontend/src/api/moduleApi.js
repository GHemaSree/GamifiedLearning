import client from "./client";

export const getModuleById = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}`);
  return response.data;
};