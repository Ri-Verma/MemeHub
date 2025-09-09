import { useEffect, useState } from "react";
import VerticalCategorySlider from "../components/VerticalCategorySlider";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Heart, 
  Share2, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Eye,
  TrendingUp,
  Sparkles,
  Filter,
  Search,
  Grid,
  List,
  User,
  Calendar,
  Download,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [likedMemes, setLikedMemes] = useState<Set<number>>(new Set());
  const [bookmarkedMemes, setBookmarkedMemes] = useState<Set<number>>(new Set());
  const [hoveredMeme, setHoveredMeme] = useState<number | null>(null);
  const [playingVideos, setPlayingVideos] = useState<Set<number>>(new Set());
  const [mutedVideos, setMutedVideos] = useState<Set<number>>(new Set());
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  //  Fetch memes from backend
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

  // Filter and sort memes
  const filteredMemes = memes
    .filter(meme => 
      meme.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meme.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "popular") {
        return b.likes_count - a.likes_count;
      }
      return b.id - a.id; // latest first (assuming higher ID = newer)
    });

  const handleLike = (memeId: number) => {
    const wasLiked = likedMemes.has(memeId);
    const newLikedMemes = new Set(likedMemes);
    
    if (wasLiked) {
      newLikedMemes.delete(memeId);
    } else {
      newLikedMemes.add(memeId);
    }
    
    setLikedMemes(newLikedMemes);
    setMemes((prev) =>
      prev.map((meme) =>
        meme.id === memeId
          ? { ...meme, likes_count: wasLiked ? meme.likes_count - 1 : meme.likes_count + 1 }
          : meme
      )
    );
  };

  const handleBookmark = (memeId: number) => {
    const newBookmarkedMemes = new Set(bookmarkedMemes);
    if (bookmarkedMemes.has(memeId)) {
      newBookmarkedMemes.delete(memeId);
    } else {
      newBookmarkedMemes.add(memeId);
    }
    setBookmarkedMemes(newBookmarkedMemes);
  };

  const handleShare = async (meme: Meme) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: meme.title,
          text: meme.description,
          url: window.location.origin + `/meme/${meme.id}`,
        });
      } else {
        navigator.clipboard.writeText(window.location.origin + `/meme/${meme.id}`);
        alert("Link copied to clipboard!");
      }
    } catch (error) {
      console.error("Share failed:", error);
      alert(`Shared meme: ${meme.title}`);
    }
  };

  const toggleVideoPlay = (memeId: number, videoElement: HTMLVideoElement) => {
    const newPlayingVideos = new Set(playingVideos);
    if (playingVideos.has(memeId)) {
      videoElement.pause();
      newPlayingVideos.delete(memeId);
    } else {
      videoElement.play();
      newPlayingVideos.add(memeId);
    }
    setPlayingVideos(newPlayingVideos);
  };

  const toggleVideoMute = (memeId: number, videoElement: HTMLVideoElement) => {
    const newMutedVideos = new Set(mutedVideos);
    if (mutedVideos.has(memeId)) {
      videoElement.muted = false;
      newMutedVideos.delete(memeId);
    } else {
      videoElement.muted = true;
      newMutedVideos.add(memeId);
    }
    setMutedVideos(newMutedVideos);
  };

  const handleImageError = (memeId: number) => {
    setImageErrors(prev => new Set([...prev, memeId]));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-blue-900">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-4 border-purple-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-2 text-purple-600"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-lg font-semibold">Loading amazing memes...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      <div className="p-4 md:p-8 space-y-8">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-600 via-yellow-500 to-indigo-600 bg-clip-text text-transparent">
            Meme Central
          </h1>
          <p className="text-xl text-white max-w-2xl mx-auto">
            Discover, share, and enjoy the best memes from our amazing community!
          </p>
        </motion.div>

        {/* Category Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <VerticalCategorySlider />
        </motion.div>

        {/* Enhanced Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
        >
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search memes, categories, users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/80 border-2 border-transparent rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all duration-300"
              />
            </div>

            {/* View Controls */}
            <div className="flex items-center gap-4">
              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "latest" | "popular")}
                  className="bg-white/80 border-2 border-transparent rounded-lg px-3 py-2 focus:border-purple-500 transition-all duration-300"
                >
                  <option value="latest">Latest</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all duration-300 ${
                    viewMode === "grid" 
                      ? "bg-purple-500 text-white shadow-lg" 
                      : "text-gray-500 hover:text-purple-500"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all duration-300 ${
                    viewMode === "list" 
                      ? "bg-purple-500 text-white shadow-lg" 
                      : "text-gray-500 hover:text-purple-500"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 flex items-center justify-between text-sm text-gray-600"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {filteredMemes.length} memes found
            </span>
            {searchQuery && (
              <span>Searching for: "<strong>{searchQuery}</strong>"</span>
            )}
          </motion.div>
        </motion.div>

        {/* Memes Section */}
        <AnimatePresence>
          {filteredMemes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-16"
            >
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-lg border border-white/50 max-w-md mx-auto">
                <div className="text-6xl mb-4">🤔</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No memes found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? "Try a different search term" : "Be the first to upload a meme!"}
                </p>
                <Link
                  to="/upload"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  <Sparkles className="w-5 h-5" />
                  Upload First Meme
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                : "grid-cols-1 max-w-4xl mx-auto"
            }`}>
              {filteredMemes.map((meme, index) => (
                <motion.div
                  key={meme.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ 
                    duration: 0.4,
                    delay: index * 0.1,
                    layout: { duration: 0.3 }
                  }}
                  className={`group bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-white/50 ${
                    viewMode === "list" ? "flex" : ""
                  }`}
                  onMouseEnter={() => setHoveredMeme(meme.id)}
                  onMouseLeave={() => setHoveredMeme(null)}
                  whileHover={{ y: -5, scale: viewMode === "grid" ? 1.02 : 1.01 }}
                >
                  {/* Media Container */}
                  <div className={`relative ${
                    viewMode === "list" ? "w-48 h-36" : "w-full h-64"
                  } overflow-hidden`}>
                    {/* Media Content */}
                    {imageErrors.has(meme.id) ? (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">🖼️</div>
                          <p className="text-sm">Image not available</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {meme.file_type === "image" && (
                          <motion.img
                            src={`${API_BASE}${meme.file_path}`}
                            alt={meme.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => handleImageError(meme.id)}
                            whileHover={{ scale: 1.05 }}
                          />
                        )}

                        {meme.file_type === "video" && (
                          <div className="relative w-full h-full">
                            <video
                              ref={(el) => {
                                if (el) {
                                  el.muted = mutedVideos.has(meme.id);
                                }
                              }}
                              className="w-full h-full object-cover"
                              src={`${API_BASE}${meme.file_path}`}
                              loop
                              onError={() => handleImageError(meme.id)}
                            />
                            
                            {/* Video Controls Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <div className="flex gap-2">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const video = e.currentTarget.parentElement?.parentElement?.querySelector('video') as HTMLVideoElement;
                                    if (video) toggleVideoPlay(meme.id, video);
                                  }}
                                  className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                >
                                  {playingVideos.has(meme.id) ? (
                                    <Pause className="w-5 h-5" />
                                  ) : (
                                    <Play className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    const video = e.currentTarget.parentElement?.parentElement?.querySelector('video') as HTMLVideoElement;
                                    if (video) toggleVideoMute(meme.id, video);
                                  }}
                                  className="bg-black/50 text-white p-3 rounded-full hover:bg-black/70 transition-colors"
                                >
                                  {mutedVideos.has(meme.id) ? (
                                    <VolumeX className="w-5 h-5" />
                                  ) : (
                                    <Volume2 className="w-5 h-5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        {meme.file_type === "gif" && (
                          <motion.img
                            src={`${API_BASE}${meme.file_path}`}
                            alt={meme.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={() => handleImageError(meme.id)}
                            whileHover={{ scale: 1.05 }}
                          />
                        )}
                      </>
                    )}

                    {/* Hover Overlay with Quick Actions */}
                    <AnimatePresence>
                      {hoveredMeme === meme.id && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                        >
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-end">
                            <div className="flex gap-2">
                              {/* <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleLike(meme.id)}
                                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                                  likedMemes.has(meme.id)
                                    ? "bg-red-500/90 text-white"
                                    : "bg-white/20 text-white hover:bg-red-500/90"
                                }`}
                              >
                                 <Heart className={`w-4 h-4 ${likedMemes.has(meme.id) ? "fill-current" : ""}`} /> 
                              </motion.button> */}
                              
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleBookmark(meme.id)}
                                className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 ${
                                  bookmarkedMemes.has(meme.id)
                                    ? "bg-yellow-500/90 text-white"
                                    : "bg-white/20 text-white hover:bg-yellow-500/90"
                                }`}
                              >
                                {bookmarkedMemes.has(meme.id) ? (
                                  <BookmarkCheck className="w-4 h-4" />
                                ) : (
                                  <Bookmark className="w-4 h-4" />
                                )}
                              </motion.button>
                            </div>

                            <div className="flex gap-2">
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleShare(meme)}
                                className="p-2 rounded-full bg-white/20 text-white hover:bg-blue-500/90 transition-all duration-300 backdrop-blur-sm"
                              >
                                <Share2 className="w-4 h-4" />
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-2 rounded-full bg-white/20 text-white hover:bg-green-500/90 transition-all duration-300 backdrop-blur-sm"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = `${API_BASE}${meme.file_path}`;
                                  link.download = `${meme.title}.${meme.file_type === 'video' ? 'mp4' : 'jpg'}`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* File Type Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-sm ${
                        meme.file_type === 'video' ? 'bg-red-500/80 text-white' :
                        meme.file_type === 'gif' ? 'bg-green-500/80 text-white' :
                        'bg-blue-500/80 text-white'
                      }`}>
                        {meme.file_type.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`p-5 space-y-3 flex-1 ${viewMode === "list" ? "flex flex-col justify-between" : ""}`}>
                    <div className="space-y-3">
                      <motion.h2 
                        className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-purple-600 transition-colors duration-300"
                        whileHover={{ scale: 1.02 }}
                      >
                        {meme.title}
                      </motion.h2>
                      
                      {meme.description && (
                        <p className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                          {meme.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-500">
                          <User className="w-4 h-4" />
                          <span className="font-medium hover:text-purple-600 transition-colors">
                            {meme.username || "Anonymous"}
                          </span>
                        </div>
                        
                        <Link
                          to={`/category?name=${encodeURIComponent(meme.category)}`}
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-700 font-medium transition-colors duration-300 hover:underline"
                        >
                          <span className="text-xs">📂</span>
                          {meme.category}
                        </Link>
                      </div>
                    </div>

                    {/* Actions Bar */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      {/* <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLike(meme.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-300 ${
                          likedMemes.has(meme.id)
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${likedMemes.has(meme.id) ? "fill-current" : ""}`} />
                        <span>{meme.likes_count}</span>
                      </motion.button> */}

                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleBookmark(meme.id)}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            bookmarkedMemes.has(meme.id)
                              ? "bg-yellow-50 text-yellow-600"
                              : "text-gray-400 hover:bg-yellow-50 hover:text-yellow-600"
                          }`}
                        >
                          {bookmarkedMemes.has(meme.id) ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleShare(meme)}
                          className="p-2 rounded-lg text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                        >
                          <Share2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Home;