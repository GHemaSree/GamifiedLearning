import client from "./client";

export const getRecommendations = async () => {
  const response = await client.get("/recommendations");
  return response.data;
};