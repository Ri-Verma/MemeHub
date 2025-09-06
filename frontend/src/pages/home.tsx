import { useState } from "react";
import CategorySlider from "../components/CategorySlider";
import VerticalCategorySlider from "../components/VerticalCategorySlider";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

const initialMemes: Meme[] = [
  {
    id: 1,
    title: "Tech Life",
    description: "When your code finally works",
    file_path: "https://media.giphy.com/media/QuIxFwQo0RMT1tASlV/giphy.gif",
    file_type: "gif",
    category: "Science & Technology",
    username: "techie123",
    likes_count: 150,
  },
  {
    id: 2,
    title: "Gaming Moment",
    description: "That winning feeling",
    file_path: "https://media.giphy.com/media/HsvmmqeARrWne/giphy.gif",
    file_type: "gif",
    category: "Video Games",
    username: "gamer4life",
    likes_count: 230,
  },
  {
    id: 3,
    title: "Food Cravings",
    description: "When the pizza arrives",
    file_path: "https://media.giphy.com/media/Ae7SI3LoPYj8Q/giphy.gif",
    file_type: "gif",
    category: "Food & Cooking",
    username: "foodlover",
    likes_count: 180,
  },
  {
    id: 4,
    title: "Workout Time",
    description: "Monday at the gym be like",
    file_path: "https://media.giphy.com/media/PKcEXtIUzLxYI/giphy.gif",
    file_type: "gif",
    category: "Gym & Fitness",
    username: "fitfam",
    likes_count: 120,
  },
  {
    id: 5,
    title: "90s Kids Will Remember",
    description: "The good old days",
    file_path: "https://media.giphy.com/media/3oKHWrD5CQu7qGShxu/giphy.gif",
    file_type: "gif",
    category: "Nostalgia",
    username: "90skid",
    likes_count: 340,
  },
];

const Home = () => {
  const [memes, setMemes] = useState<Meme[]>(initialMemes);

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
    // demo share
    alert(`Shared meme with ID: ${memeId}`);
  };

  return (
    <div className="p-4 md:p-8 space-y-10">
      {/* Category slider at the top */}
      <CategorySlider />

      {/* Vertical slider (hero style text) */}
      <VerticalCategorySlider />

      {/* Memes Section */}
      <h1 className="text-4xl font-extrabold mb-6 text-gray-800 tracking-tight">
        Latest Memes
      </h1>

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
                src={meme.file_path}
                alt={meme.title}
                className="w-full h-64 object-cover"
              />
            )}
            {meme.file_type === "video" && (
              <video
                controls
                className="w-full h-64 object-cover"
                src={meme.file_path}
              />
            )}
            {meme.file_type === "gif" && (
              <img
                src={meme.file_path}
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
                <span>👤 {meme.username}</span>
                <Link to={`/category?name=${encodeURIComponent(meme.category)}`}className="text-blue-500 hover:underline"> 📂 {meme.category}
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
    </div>
  );
};

export default Home;
