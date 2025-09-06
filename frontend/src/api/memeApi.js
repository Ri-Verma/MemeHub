import axios from "axios";

// Base axios instance
const API = axios.create({
  baseURL: "http://localhost:5000/api/memes", // adjust to your backend route
  withCredentials: true, // allows sending cookies (if using auth sessions)
});

// Get all memes
export const getMemes = async () => {
  const res = await API.get("/");
  return res.data;
};

// Get memes by category
export const getMemesByCategory = async (category) => {
  const res = await API.get(`/category/${encodeURIComponent(category)}`);
  return res.data;
};

// Like a meme
export const likeMeme = async (memeId) => {
  const res = await API.post(`/${memeId}/like`);
  return res.data;
};

// Share a meme
export const shareMeme = async (memeId) => {
  const res = await API.post(`/${memeId}/share`);
  return res.data;
};

// Create a new meme
export const createMeme = async (formData) => {
  const res = await API.post("/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
