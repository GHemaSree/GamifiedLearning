import client from "./client";

export const getMyTrails = async () => {
  const response = await client.get("/trails");
  return response.data;
};

export const createTrail = async (topicId) => {
  const response = await client.post("/trails", { topicId });
  return response.data;
};

export const getTrailById = async (trailId) => {
  const response = await client.get(`/trails/${trailId}`);
  return response.data;
};

export const getTrailByTopic = async (topicId) => {
  const response = await client.get(`/trails/topic/${topicId}`);
  return response.data;
};
export const generateNextModule = async (trailId) => {
  const response = await client.post(`/trails/${trailId}/next-module`);
  return response.data;
};