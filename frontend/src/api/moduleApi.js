import client from "./client";

export const getModuleById = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}`);
  return response.data;
};

export const getModuleQuiz = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}/quiz`);
  return response.data;
};

export const getFullNotes = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}/full-notes`);
  return response.data.data;
};

export const getModuleContent = async (moduleId) => {
  const response = await client.get(`/modules/${moduleId}/content`);
  return response.data.data;
};

// Clears cached module content so it regenerates with updated DKT mastery
export const clearModuleContentCache = async (moduleId) => {
  const response = await client.delete(`/modules/${moduleId}/content/cache`);
  return response.data;
};

// Clears cached quiz so it regenerates using the adaptive prompt
export const clearModuleQuizCache = async (moduleId) => {
  const response = await client.delete(`/modules/${moduleId}/quiz/cache`);
  return response.data;
};