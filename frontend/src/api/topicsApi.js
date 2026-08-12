import client from "./client";

export const getTopics = async () => {
  const response = await client.get("/topics");
  return response.data;
};
export const getTopicById = async (topicId) => {
  const response = await client.get(`/topics/${topicId}`);
  return response.data;
};
export const createTopic = async (topicData) => {
  const response = await client.post("/topics", topicData);
  return response.data;
};
export const updateTopic = async (id, topicData) => {
  const response = await client.put(`/topics/${id}`, topicData);
  return response.data;
};
export const deleteTopic = async (id) => {
  const response = await client.delete(`/topics/${id}`);
  return response.data;
};