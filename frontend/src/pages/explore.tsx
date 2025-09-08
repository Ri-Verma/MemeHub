import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getAllMemes } from "../api/memeApi"; // Your backend API call
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000"; // Backend URL

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

const fileTypes = ["All", "image", "video", "gif"];

const Explore = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [filteredMemes, setFilteredMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchMemes = async () => {
      setLoading(true);
      try {
        const data = await getAllMemes();
        setMemes(data || []);
        setFilteredMemes(data || []);
      } catch (err) {
        console.error("Failed to fetch memes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMemes();
  }, []);

  // Filter memes whenever category, type, or search changes
  useEffect(() => {
    let temp = [...memes];
    if (selectedCategory !== "All") {
      temp = temp.filter((m) => m.category === selectedCategory);
    }
    if (selectedType !== "All") {
      temp = temp.filter((m) => m.file_type === selectedType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      temp = temp.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.username && m.username.toLowerCase().includes(q))
      );
    }
    setFilteredMemes(temp);
  }, [selectedCategory, selectedType, searchQuery, memes]);

  return (
    <div className="p-6 md:p-10 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6">Explore Memes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        

        {/* Type filter */}
        <div className="flex flex-wrap gap-2">
          {fileTypes.map((type) => (
            <button
              key={type}
              className={`px-4 py-2 rounded-full font-medium transition ${
                selectedType === type
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-200 hover:bg-blue-300"
              }`}
              onClick={() => setSelectedType(type)}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search by title or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ml-auto px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none w-full md:w-72 transition"
        />
      </div>

      {/* Meme Grid */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading memes...</p>
      ) : filteredMemes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMemes.map((meme) => (
            <motion.div
              key={meme.id}
              className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.03 }}
            >
              {meme.file_type === "video" ? (
                <video
                  controls
                  src={`${API_BASE}${meme.file_path}`}
                  className="w-full h-64 object-cover rounded-t-3xl"
                />
              ) : (
                <img
                  src={`${API_BASE}${meme.file_path}`}
                  alt={meme.title}
                  className="w-full h-64 object-cover rounded-t-3xl"
                />
              )}

              <div className="p-5 space-y-2">
                <h2 className="text-xl font-bold text-gray-900">{meme.title}</h2>
                <p className="text-gray-600 text-sm line-clamp-2">{meme.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>👤 {meme.username || "Anonymous"}</span>
                  <span>❤️ {meme.likes_count}</span>
                </div>
                <div className="mt-2">
                  <Link
                    to={`/categories?name=${encodeURIComponent(meme.category)}`}
                    className="text-purple-600 hover:underline text-sm font-medium"
                  >
                    📂 {meme.category}
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No memes found for your filters.</p>
      )}
    </div>
  );
};

export default Explore;
