import client from "./client";

export const getMyBadges = async () => {
  const response = await client.get("/achievements");
  return response.data;
};