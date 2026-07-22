import client from "./client";

export const submitQuiz = async (quizId, answers) => {
  const response = await client.post(`/quiz/${quizId}/submit`, { answers });
  return response.data;
};