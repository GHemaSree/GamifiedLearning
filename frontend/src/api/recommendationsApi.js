import client from "./client";

export const getRecommendations = async () => {
  const response = await client.get("/recommendations");
  return response.data;
};

export const refreshRecommendations = async () => {
  const response = await client.post("/recommendations/refresh");
  return response.data;
};