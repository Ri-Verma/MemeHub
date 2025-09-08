import { useEffect, useState } from "react";
import VerticalCategorySlider from "../components/VerticalCategorySlider";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { getAllMemes } from "../api/memeApi";



const API_BASE = "http://localhost:5000";

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

const Home = () => {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch memes from backend
  useEffect(() => {
    const fetchMemes = async () => {
      try {
        const response = await getAllMemes(); // from memeApi.ts
        setMemes(response || []);
      } catch (error) {
        console.error("Error fetching memes:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMemes();
  }, []);

  const handleLike = (memeId: number) => {
    setMemes((prev) =>
      prev.map((meme) =>
        meme.id === memeId
          ? { ...meme, likes_count: meme.likes_count + 1 }
          : meme
      )
    );
  };

  const handleShare = (memeId: number) => {
    alert(`Shared meme with ID: ${memeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-10">
      {/* Category slider at the top */}


      {/* Vertical hero slider */}
      <VerticalCategorySlider />

      {/* Memes Section */}
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
        Latest Memes
      </h1>

      {memes.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          No memes uploaded yet. Be the first to upload! 🚀
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {memes.map((meme) => (
            <motion.div
              key={meme.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Media preview */}
              {meme.file_type === "image" && (
  <img
    src={`${API_BASE}${meme.file_path}`}
    alt={meme.title}
    className="w-full h-64 object-cover"
  />
)}

{meme.file_type === "video" && (
  <video
    controls
    className="w-full h-64 object-cover"
    src={`${API_BASE}${meme.file_path}`}
  />
)}

{meme.file_type === "gif" && (
  <img
    src={`${API_BASE}${meme.file_path}`}
    alt={meme.title}
    className="w-full h-64 object-cover"
  />
)}


              {/* Card content */}
              <div className="p-5 space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">
                  {meme.title}
                </h2>
                <p className="text-gray-600 line-clamp-2">{meme.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>👤 {meme.username || "Anonymous"}</span>
                  <Link
                    to={`/category?name=${encodeURIComponent(meme.category)}`}
                    className="text-blue-500 hover:underline"
                  >
                    📂 {meme.category}
                  </Link>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleLike(meme.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 font-medium transition"
                  >
                    ❤️ {meme.likes_count}
                  </button>
                  <button
                    onClick={() => handleShare(meme.id)}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium transition"
                  >
                    🔗 Share
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
