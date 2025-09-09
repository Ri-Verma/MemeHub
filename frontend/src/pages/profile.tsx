import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Camera, 
  UserPlus, 
  UserMinus,
  Users,
  Heart,
  MessageCircle,
  Settings,
  LogOut,
  Edit,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Award,
  Star,
  Sparkles,
  Check,
  X
} from "lucide-react";
import { login, signup, getUserById, getFollowers, getFollowing } from "../api/userApi";
import { getAllMemes } from "../api/memeApi";



interface User {
  id: number;
  username: string;
  email: string;
  profile_pic?: string;
  bio?: string;
  followers_count?: number;
  following_count?: number;
  posts_count?: number;
  location?: string;
  website?: string;
  joined_date?: string;
  is_following?: boolean;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    bio: "",
    profile_pic: "",
  });
  const [postsCount, setPostsCount] = useState(0);

  // Load user from localStorage or backend
    useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("meme_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          const res = await getUserById(parsed.id);

          if (res.success && res.user) {
            setUser(res.user);
          } else {
            setUser(parsed);
          }

          // Fetch stats from backend
          const [followersRes, followingRes, memes] = await Promise.all([
            getFollowers(parsed.id),
            getFollowing(parsed.id),
            getAllMemes()
          ]);

          if (followersRes.success) {
            setFollowersCount(followersRes.followers.length);
          }
          if (followingRes.success) {
            setFollowingCount(followingRes.following.length);
          }
          if (memes) {
            const userPosts = memes.filter((m: any) => m.user_id === parsed.id);
            setPostsCount(userPosts.length);
          }
        } catch (e) {
          console.error("Error fetching user", e);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!isLogin && !formData.username.trim()) {
      errors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
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
        if (fullUser.success && fullUser.user) {
          setUser(fullUser.user);
          setFollowersCount(fullUser.user.followers_count || 0);
          setFollowingCount(fullUser.user.following_count || 0);
        } else {
          setUser(res.user);
        }
        
        // Dispatch auth change event for header sync
        window.dispatchEvent(new CustomEvent("authChange"));
        
        // Reset form
        setFormData({
          username: "",
          email: "",
          password: "",
          bio: "",
          profile_pic: "",
        });
      } else {
        alert(res.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Auth failed", err);
      alert("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("meme_user");
    setUser(null);
    window.dispatchEvent(new CustomEvent("authChange"));
  };

  const handleFollow = async () => {
    try {
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      
      // TODO: Implement actual API call
      // await followUser(user.id);
    } catch (error) {
      // Revert on error
      setIsFollowing(isFollowing);
      setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
      console.error("Follow action failed:", error);
    }
  };

  const getUserAvatar = () => {
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

    if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <motion.div
              className="w-16 h-16 border-4 border-purple-200 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-600 rounded-full"></div>
            </motion.div>
          </div>
          <motion.p
            className="text-lg font-semibold text-gray-700 flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            Loading profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {isLogin ? "Welcome Back!" : "Join MemeHub"}
              </h2>
              <p className="text-gray-600 mt-2">
                {isLogin ? "Sign in to your account" : "Create your account to get started"}
              </p>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence>
                {!isLogin && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Username Field */}
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          name="username"
                          placeholder="Username"
                          value={formData.username}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("username")}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                            focusedField === "username"
                              ? "border-purple-500 ring-4 ring-purple-200 scale-105"
                              : formErrors.username
                              ? "border-red-400"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                          required={!isLogin}
                        />
                        {formErrors.username && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-500 text-sm mt-1 flex items-center gap-1"
                          >
                            <X className="w-3 h-3" />
                            {formErrors.username}
                          </motion.p>
                        )}
                      </div>

                      {/* Bio Field */}
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-4 text-gray-400 w-5 h-5" />
                        <textarea
                          name="bio"
                          placeholder="Tell us about yourself..."
                          value={formData.bio}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("bio")}
                          onBlur={() => setFocusedField(null)}
                          rows={3}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none ${
                            focusedField === "bio"
                              ? "border-purple-500 ring-4 ring-purple-200 scale-105"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        />
                      </div>

                      {/* Profile Pic Field */}
                      <div className="relative">
                        <Camera className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="url"
                          name="profile_pic"
                          placeholder="Profile picture URL (optional)"
                          value={formData.profile_pic}
                          onChange={handleChange}
                          onFocus={() => setFocusedField("profile_pic")}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                            focusedField === "profile_pic"
                              ? "border-purple-500 ring-4 ring-purple-200 scale-105"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                    focusedField === "email"
                      ? "border-purple-500 ring-4 ring-purple-200 scale-105"
                      : formErrors.email
                      ? "border-red-400"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  required
                />
                {formErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    {formErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                    focusedField === "password"
                      ? "border-purple-500 ring-4 ring-purple-200 scale-105"
                      : formErrors.password
                      ? "border-red-400"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                {formErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    {formErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:scale-105 hover:shadow-xl"
                } text-white relative overflow-hidden`}
                whileTap={{ scale: 0.95 }}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    {isLogin ? "Signing in..." : "Creating account..."}
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"}
                    <Sparkles className="w-5 h-5" />
                  </span>
                )}
              </motion.button>
            </form>

            {/* Toggle Login/Signup */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormErrors({});
                  }}
                  className="text-purple-600 hover:text-purple-800 font-semibold hover:underline transition-colors"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </p>
            </motion.div>
          </div>
        </motion.div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Cover Section */}
          <div className="h-48 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-4 right-4">
              <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="relative px-8 pb-8">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-8">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {user.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-6 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-6 border-white shadow-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-2 right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Camera className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">

              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>

            {/* User Info */}
            <div className="mt-16 space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {user.bio && (
                    <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">{user.bio}</p>
                  )}
                </div>

                {/*  Stats from backend */}
                <div className="flex gap-8">
                  <motion.div className="text-center cursor-pointer group" whileHover={{ scale: 1.05 }}>
                    <div className="text-3xl font-bold text-purple-600 group-hover:text-purple-800 transition-colors">
                      {postsCount}
                    </div>
                    <div className="text-gray-600 font-medium">Posts</div>
                  </motion.div>

                  <motion.div className="text-center cursor-pointer group" whileHover={{ scale: 1.05 }}>
                    <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
                      {followersCount}
                    </div>
                    <div className="text-gray-600 font-medium">Followers</div>
                  </motion.div>

                  <motion.div className="text-center cursor-pointer group" whileHover={{ scale: 1.05 }}>
                    <div className="text-3xl font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                      {followingCount}
                    </div>
                    <div className="text-gray-600 font-medium">Following</div>
                  </motion.div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-6 text-gray-600">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}

                {user.website && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Joined{" "}
                    {user.joined_date
                      ? new Date(user.joined_date).toLocaleDateString()
                      : "Recently"}
                  </span>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="flex flex-wrap gap-3">
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Award className="w-4 h-4" />
                  <span className="font-medium">Meme Master</span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">Community Favorite</span>
                </motion.div>

                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="w-4 h-4" />
                  <span className="font-medium">Rising Star</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Cover Section */}
          <div className="h-48 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-4 right-4">
              <button className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-all duration-300 hover:scale-110">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="relative px-8 pb-8">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-8">
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {user.profile_pic ? (
                  <img
                    src={user.profile_pic}
                    alt="Profile"
                    className="w-32 h-32 rounded-full border-6 border-white shadow-xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-6 border-white shadow-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{getUserAvatar()}</span>
                  </div>
                )}
                <button className="absolute bottom-2 right-2 bg-white text-purple-600 p-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                  <Camera className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <motion.button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                <Edit className="w-4 h-4" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </motion.button>
              
              <motion.button
                onClick={handleLogout}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>

            {/* User Info */}
            <div className="mt-16 space-y-6">
              {/* Name and Stats */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold text-gray-900">{user.username}</h1>
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </p>
                  {user.bio && (
                    <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">{user.bio}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-8">
                  <motion.div
                    className="text-center cursor-pointer group"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-3xl font-bold text-purple-600 group-hover:text-purple-800 transition-colors">
                      {user.posts_count || 0}
                    </div>
                    <div className="text-gray-600 font-medium">Posts</div>
                  </motion.div>
                  
                  <motion.div
                    className="text-center cursor-pointer group"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => console.log("Show followers")}
                  >
                    <div className="text-3xl font-bold text-blue-600 group-hover:text-blue-800 transition-colors">
                      {followersCount}
                    </div>
                    <div className="text-gray-600 font-medium">Followers</div>
                  </motion.div>
                  
                  <motion.div
                    className="text-center cursor-pointer group"
                    whileHover={{ scale: 1.05 }}
                    onClick={() => console.log("Show following")}
                  >
                    <div className="text-3xl font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                      {followingCount}
                    </div>
                    <div className="text-gray-600 font-medium">Following</div>
                  </motion.div>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-6 text-gray-600">
                {user.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                
                {user.website && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 hover:underline"
                    >
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {user.joined_date ? new Date(user.joined_date).toLocaleDateString() : 'Recently'}</span>
                </div>
              </div>

              {/* Follow Button (for other users' profiles) */}
              {/* This would be shown when viewing someone else's profile */}
              <div className="hidden">
                <motion.button
                  onClick={handleFollow}
                  className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-600"
                      : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-5 h-5" />
                      Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Follow
                    </>
                  )}
                </motion.button>
              </div>

              {/* Achievement Badges */}
              <div className="flex flex-wrap gap-3">
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Award className="w-4 h-4" />
                  <span className="font-medium">Meme Master</span>
                </motion.div>
                
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Heart className="w-4 h-4" />
                  <span className="font-medium">Community Favorite</span>
                </motion.div>
                
                <motion.div
                  className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <Star className="w-4 h-4" />
                  <span className="font-medium">Rising Star</span>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;