import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface Meme {
  id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: "image" | "video" | "gif";
  category: string;
  username: string;
  likes_count: number;
}

const API_BASE = "http://localhost:5000"; // backend base URL

const categories = [
  "Historical Events",
  "Science & Technology",
  "Food & Cooking",
  "Gym & Fitness",
  "Parenting",
  "Nostalgia (90s/2000s kids)",
  "Travel",
  "Pop Culture & Entertainment",
  "Video Games",
  "Animals",
  "Cartoons & Animation",
  "Dark Humor",
];

const Categories = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const defaultCategory = queryParams.get("name") || "All";

  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch memes from backend
  const fetchMemes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/memes`, {
        credentials: "include",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch memes");
      }

      const data: Meme[] = await response.json();

      // Filter client-side for selected category
      const filtered = selectedCategory === "All"
        ? data
        : data.filter((m) => m.category === selectedCategory);

      setMemes(filtered);
    } catch (err) {
      console.error("Failed to fetch memes:", err);
      setMemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, [selectedCategory]);

  return (
    <div className="p-6 md:p-10 space-y-8">
      <h1 className="text-4xl font-extrabold text-cyan-400">Categories</h1>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-4 py-2 rounded-full font-medium transition ${
            selectedCategory === "All"
              ? "bg-yellow-400 text-white shadow-md"
              : "bg-gray-200 hover:bg-yellow-300"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedCategory === cat
                ? "bg-yellow-400 text-white shadow-md"
                : "bg-gray-200 hover:bg-yellow-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Meme Grid */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading memes...</p>
      ) : memes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memes.map((meme) => (
            <motion.div
              key={meme.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              {meme.file_type === "video" ? (
                <video
                  controls
                  src={`${API_BASE}${meme.file_path}`}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <img
                  src={`${API_BASE}${meme.file_path}`}
                  alt={meme.title}
                  className="w-full h-64 object-cover"
                />
              )}

              <div className="p-4 space-y-2">
                <h2 className="text-xl font-bold">{meme.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2">{meme.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>👤 {meme.username || "Anonymous"}</span>
                  {/* <span>❤️ {meme.likes_count}</span> */}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 mt-10 text-center">No memes available for this category.</p>
      )}
    </div>
  );
};

export default Categories;
