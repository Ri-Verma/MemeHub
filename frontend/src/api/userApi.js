import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api/users", // backend base route
  withCredentials: true,
});

// ---------------- AUTH ---------------- //
export const signup = async (data) => {
  try {
    const res = await API.post("/register", data); // backend expects /register
    if (res.data.success && res.data.user && res.data.token) {
      localStorage.setItem("meme_user", JSON.stringify(res.data.user));
      localStorage.setItem("auth_token", res.data.token);
    }
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Signup failed",
    };
  }
};

export const login = async (data) => {
  try {
    const res = await API.post("/login", data);
    if (res.data.success && res.data.user && res.data.token) {
      localStorage.setItem("meme_user", JSON.stringify(res.data.user));
      localStorage.setItem("auth_token", res.data.token);
    }
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Login failed",
    };
  }
};

export const logout = async () => {
  localStorage.removeItem("meme_user");
  localStorage.removeItem("auth_token");
  return { success: true };
};

// ---------------- AUTH CHECK ---------------- //
// Fake checkAuthStatus since backend has no /verify route
export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem("auth_token");
    const user = JSON.parse(localStorage.getItem("meme_user"));
    if (token && user) {
      return { success: true, user };
    }
    return { success: false, message: "Not authenticated" };
  } catch (error) {
    return { success: false, message: "Auth check failed" };
  }
};

// ---------------- USER ---------------- //
export const getAllUsers = async () => {
  try {
    const res = await API.get("/");
    return res.data;
  } catch (error) {
    return { success: false, message: "Failed to fetch users" };
  }
};

export const getUserById = async (userId) => {
  try {
    const res = await API.get(`/${userId}`);
    return res.data;
  } catch (error) {
    return { success: false, message: "Failed to fetch user" };
  }
};

// ---------------- FOLLOW ---------------- //
export const followUser = async (userId) => {
  try {
    const token = localStorage.getItem("auth_token");
    const res = await API.post(`/follow/${userId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return { success: false, message: "Failed to follow user" };
  }
};

export const unfollowUser = async (userId) => {
  try {
    const token = localStorage.getItem("auth_token");
    const res = await API.delete(`/unfollow/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    return { success: false, message: "Failed to unfollow user" };
  }
};
