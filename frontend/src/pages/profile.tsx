import React, { useState, useEffect } from "react";
import { login, signup, getUserById } from "../api/userApi";

interface User {
  id: number;
  username: string;
  email: string;
  profile_pic?: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profile_pic: "",
  });

  // Load user from localStorage or backend
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("meme_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const res = await getUserById(parsed.id);
          if (res.success && res.user) setUser(res.user);
          else setUser(parsed); // fallback to stored data
        } catch (e) {
          console.error("Error fetching user", e);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (isLogin) {
        res = await login({ email: formData.email, password: formData.password });
      } else {
        res = await signup(formData);
      }

      if (res.success && res.user) {
        localStorage.setItem("meme_user", JSON.stringify(res.user));
        const fullUser = await getUserById(res.user.id);
        if (fullUser.success && fullUser.user) setUser(fullUser.user);
        else setUser(res.user);
      } else {
        alert(res.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Auth failed", err);
      alert("An error occurred");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("meme_user");
    setUser(null);
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? "Login to MemeHub" : "Create Account"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
                <textarea
                  name="bio"
                  placeholder="Bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  name="profile_pic"
                  placeholder="Profile Pic URL"
                  value={formData.profile_pic}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </>
            )}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-indigo-600 hover:underline"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-lg text-center">
        <img
          src={user.profile_pic || "https://via.placeholder.com/150"}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h1 className="text-2xl font-bold">{user.username}</h1>
        <p className="text-gray-600">{user.email}</p>
        {user.bio && <p className="mt-2 text-gray-700">{user.bio}</p>}
        <button
          onClick={handleLogout}
          className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
