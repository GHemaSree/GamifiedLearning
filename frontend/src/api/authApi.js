import axios from "axios";
import client from "./client";

const API_BASE_URL = "https://trailforge-backend-633e.onrender.com";

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
};

export const registerUser = async (name, email, password, role) => {
  const response = await axios.post(`${API_BASE_URL}/auth/register`, {
    name,
    email,
    password,
    role,
  });
  return response.data;
};
export const getCurrentUser = async () => {
  const response = await client.get("/auth/me");
  return response.data;
};
export const getUsers = async () => {
  const response = await client.get("/auth/users");
  return response.data;
};