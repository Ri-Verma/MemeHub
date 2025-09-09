import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  X,
  Tag,
  FileText,
  Image,
  Video,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Plus,
} from "lucide-react";
import { checkAuthStatus } from "../api/userApi";
import { createMeme } from "../api/memeApi";

interface User {
  id: number;
  username: string;
  email: string;
}

interface UploadFormData {
  title: string;
  description: string;
  category: string;
  file: File | null;
  tags: string[];
}

const MemeUpload = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<UploadFormData>({
    title: "",
    description: "",
    category: "",
    file: null,
    tags: [],
  });
  const [currentTag, setCurrentTag] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Authentication check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const response = await checkAuthStatus();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          navigate("/login");
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  // File selection with enhanced validation
  const handleFileSelect = (file: File) => {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage("File size must be less than 50MB");
      setUploadStatus("error");
      return;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setErrorMessage("Only images/videos allowed (JPG, PNG, GIF, MP4, etc.)");
      setUploadStatus("error");
      return;
    }
    setFormData((prev) => ({ ...prev, file }));
    setPreviewUrl(URL.createObjectURL(file));
    setUploadStatus("idle");
    setErrorMessage("");
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFileSelect(e.target.files[0]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Enhanced tag functions
  const addTag = () => {
    if (
      currentTag.trim() &&
      !formData.tags.includes(currentTag.trim()) &&
      formData.tags.length < 10
    ) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, currentTag.trim()] }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove),
    }));
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  // Enhanced submission with progress simulation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.title || !formData.category) {
      setErrorMessage("Please fill in all required fields and select a file");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    setUploadProgress(0);
    
    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const uploadFormData = new FormData();
      uploadFormData.append("meme", formData.file as File);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("tags", JSON.stringify(formData.tags));

      await createMeme(uploadFormData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus("success");
      
      setTimeout(() => {
        setFormData({ title: "", description: "", category: "", file: null, tags: [] });
        setPreviewUrl(null);
        setUploadStatus("idle");
        setUploadProgress(0);
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Upload error:", error.response || error);
      setErrorMessage(error?.response?.data?.message || "Upload failed. Please try again.");
      setUploadStatus("error");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!formData.file) return <Upload className="w-12 h-12" />;
    return formData.file.type.startsWith("video/") ? 
      <Video className="w-12 h-12" /> : 
      <Image className="w-12 h-12" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-purple-600 animate-bounce" />
            <span className="text-xl font-semibold text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
          {/* Animated Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 animate-pulse"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold flex items-center gap-3 transform transition-transform duration-300 hover:scale-105">
                <Upload className="w-8 h-8 animate-bounce" />
                Upload Your Meme
              </h1>
              <p className="mt-2 opacity-90 animate-fade-in">
                Share your creativity, <span className="font-semibold">{user?.username}</span>! ✨
              </p>
            </div>
          </div>

          {/* Enhanced Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Enhanced File Upload with Drag & Drop */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Upload File <span className="text-red-500">*</span>
              </label>
              
              <div
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
                  isDragging
                    ? "border-purple-500 bg-purple-50 scale-105"
                    : formData.file
                    ? "border-green-400 bg-green-50"
                    : "border-gray-300 hover:border-purple-400 hover:bg-purple-50/30"
                } ${focusedField === "file" ? "ring-4 ring-purple-200" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileInputChange}
                  onFocus={() => setFocusedField("file")}
                  onBlur={() => setFocusedField(null)}
                  className="hidden"
                />
                
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-full ${formData.file ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"} transition-all duration-300`}>
                    {getFileIcon()}
                  </div>
                  
                  {formData.file ? (
                    <div className="space-y-2">
                      <p className="text-green-600 font-semibold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        File Selected: {formData.file.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-lg font-medium text-gray-700">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-sm text-gray-500">
                        Supports images and videos up to 50MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Preview */}
              {previewUrl && (
                <div className="relative group">
                  <div className="overflow-hidden rounded-2xl shadow-lg">
                    {formData.file?.type.startsWith("video/") ? (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="max-h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, file: null }));
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Title Input */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("title")}
                onBlur={() => setFocusedField(null)}
                placeholder="Give your meme a catchy title..."
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  focusedField === "title" 
                    ? "border-purple-500 ring-4 ring-purple-200 scale-105" 
                    : "border-gray-300 hover:border-purple-400"
                }`}
              />
            </div>

            {/* Enhanced Description */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("description")}
                onBlur={() => setFocusedField(null)}
                placeholder="Tell us more about your meme..."
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 resize-none ${
                  focusedField === "description" 
                    ? "border-purple-500 ring-4 ring-purple-200 scale-105" 
                    : "border-gray-300 hover:border-purple-400"
                }`}
              />
            </div>

            {/* Enhanced Category Selection */}
            <div className="space-y-3">
              <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  focusedField === "category" 
                    ? "border-purple-500 ring-4 ring-purple-200 scale-105" 
                    : "border-gray-300 hover:border-purple-400"
                }`}
              >
                <option value="">Select a category...</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Enhanced Tags Section */}
            <div className="space-y-4">
              <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags (max 10)
                <span className="text-sm font-normal text-gray-500 ml-2">
                  {formData.tags.length}/10
                </span>
              </label>
              
              {/* Tag Display */}
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-purple-50 rounded-xl">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={tag}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 transform transition-all duration-300 hover:scale-105 animate-slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-white/80 hover:text-white transition-colors duration-200 hover:bg-white/20 rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              <div className="relative">
                <input
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleTagKeyPress}
                  onFocus={() => setFocusedField("tags")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Type and press Enter to add tags..."
                  disabled={formData.tags.length >= 10}
                  className={`w-full px-4 py-3 pr-12 border-2 rounded-xl transition-all duration-300 ${
                    focusedField === "tags" 
                      ? "border-purple-500 ring-4 ring-purple-200" 
                      : "border-gray-300 hover:border-purple-400"
                  } ${formData.tags.length >= 10 ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={!currentTag.trim() || formData.tags.length >= 10}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-purple-500 text-white rounded-lg p-2 hover:bg-purple-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Enhanced Status Messages */}
            {uploadStatus === "error" && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-shake">
                <AlertCircle className="w-5 h-5" />
                <span>{errorMessage}</span>
              </div>
            )}
            
            {uploadStatus === "success" && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-xl flex items-center gap-3 animate-bounce">
                <CheckCircle className="w-5 h-5" />
                <span>Meme uploaded successfully! Redirecting...</span>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading your meme...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Enhanced Submit Button */}
            <button
              type="submit"
              disabled={isUploading || !formData.file || !formData.title || !formData.category}
              className={`w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform ${
                isUploading || !formData.file || !formData.title || !formData.category
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-105 hover:shadow-2xl hover:from-purple-700 hover:to-blue-700 active:scale-95"
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Uploading Your Meme...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Upload className="w-5 h-5" />
                  Upload Meme
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MemeUpload;