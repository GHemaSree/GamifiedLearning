import client from "./client";

export const getMyProgress = async () => {
  const response = await client.get("/progress");
  return response.data;
};