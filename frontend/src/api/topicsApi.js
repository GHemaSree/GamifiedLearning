import client from "./client";

export const getTopics = async () => {
  const response = await client.get("/topics");
  return response.data;
};
export const getTopicById = async (topicId) => {
  const response = await client.get(`/topics/${topicId}`);
  return response.data;
};