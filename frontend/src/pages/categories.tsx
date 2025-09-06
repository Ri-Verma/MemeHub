import { useState } from "react";
import { useLocation } from "react-router-dom";

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
];

const memes: Meme[] = [
  {
    id: 1,
    title: "Apollo Mission",
    description: "When Neil Armstrong said the line...",
    file_path: "https://media.giphy.com/media/26tknCqiJrBQG6bxC/giphy.gif",
    file_type: "gif",
    category: "Historical Events",
    username: "historybuff",
    likes_count: 98,
  },
  {
    id: 2,
    title: "Coding Victory",
    description: "When your code finally compiles",
    file_path: "https://media.giphy.com/media/QuIxFwQo0RMT1tASlV/giphy.gif",
    file_type: "gif",
    category: "Science & Technology",
    username: "techie",
    likes_count: 150,
  },
  {
    id: 3,
    title: "Pizza Time",
    description: "When the pizza delivery guy is here!",
    file_path: "https://media.giphy.com/media/Ae7SI3LoPYj8Q/giphy.gif",
    file_type: "gif",
    category: "Food & Cooking",
    username: "foodie",
    likes_count: 200,
  },
  {
    id: 4,
    title: "Workout Mood",
    description: "First day at the gym be like...",
    file_path: "https://media.giphy.com/media/PKcEXtIUzLxYI/giphy.gif",
    file_type: "gif",
    category: "Gym & Fitness",
    username: "fitlife",
    likes_count: 120,
  },
  {
    id: 5,
    title: "90s Kids",
    description: "Only real 90s kids will remember this!",
    file_path: "https://media.giphy.com/media/3oKHWrD5CQu7qGShxu/giphy.gif",
    file_type: "gif",
    category: "Nostalgia (90s/2000s kids)",
    username: "retroKid",
    likes_count: 340,
  },
];

const Categories = () => {
  const location = useLocation(); // ✅ inside component
  const queryParams = new URLSearchParams(location.search);
  const defaultCategory = queryParams.get("name") || "All";

  const [selectedCategory, setSelectedCategory] =
    useState<string>(defaultCategory);

  const filteredMemes =
    selectedCategory === "All"
      ? memes
      : memes.filter((meme) => meme.category === selectedCategory);

  return (
    <div className="p-6 md:p-10 space-y-8">
      <h1 className="text-4xl font-extrabold text-gray-800">Categories</h1>

      {/* Categories list */}
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

      {/* Meme grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMemes.length > 0 ? (
          filteredMemes.map((meme) => (
            <div
              key={meme.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition"
            >
              {meme.file_type === "gif" || meme.file_type === "image" ? (
                <img
                  src={meme.file_path}
                  alt={meme.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <video
                  controls
                  src={meme.file_path}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-4 space-y-2">
                <h2 className="text-xl font-bold">{meme.title}</h2>
                <p className="text-gray-600 text-sm">{meme.description}</p>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>👤 {meme.username}</span>
                  <span>❤️ {meme.likes_count}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No memes available for this category.</p>
        )}
      </div>
    </div>
  );
};

export default Categories;
