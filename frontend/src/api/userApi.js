import axios from "axios";

// Base axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api/users",
  withCredentials: true,
});

// Signup
export const signup = async (userData) => {
  const res = await API.post("/signup", userData);
  return res.data;
};

// Login
export const login = async (credentials) => {
  const res = await API.post("/login", credentials);
  return res.data;
};

// Logout
export const logout = async () => {
  const res = await API.post("/logout");
  return res.data;
};

// Get current user (profile)
export const getProfile = async () => {
  const res = await API.get("/profile");
  return res.data;
};
