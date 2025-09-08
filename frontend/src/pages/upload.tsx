import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Image,
  Video,
  FileImage,
  X,
  Send,
  AlertCircle,
  CheckCircle,
  Tag,
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
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

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
  ];

  // ✅ Authentication check
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

  // ✅ File selection + preview
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

  // ✅ Tag functions
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

  // ✅ Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file || !formData.title || !formData.category) {
      setErrorMessage("Please fill in all required fields and select a file");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("meme", formData.file as File);
      uploadFormData.append("title", formData.title);
      uploadFormData.append("description", formData.description);
      uploadFormData.append("category", formData.category);
      uploadFormData.append("tags", JSON.stringify(formData.tags));

      await createMeme(uploadFormData);

      setUploadStatus("success");
      setTimeout(() => {
        setFormData({ title: "", description: "", category: "", file: null, tags: [] });
        setPreviewUrl(null);
        setUploadStatus("idle");
        navigate("/");
      }, 2000);
    } catch (error: any) {
      console.error("Upload error:", error.response || error);
      setErrorMessage(error?.response?.data?.message || "Upload failed. Please try again.");
      setUploadStatus("error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Upload className="w-8 h-8" />
              Upload Your Meme
            </h1>
            <p className="mt-2 opacity-90">Share your creativity, {user?.username}!</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* File Upload */}
            <div>
              <label className="block text-lg font-semibold text-gray-900">
                Upload File <span className="text-red-500">*</span>
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileInputChange}
                className="mt-2"
              />
              {previewUrl &&
                (formData.file?.type.startsWith("video/") ? (
                  <video src={previewUrl} controls className="max-h-48 rounded-xl mt-4" />
                ) : (
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-xl mt-4" />
                ))}
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-semibold text-gray-900">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-lg font-semibold text-gray-900">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl mt-2"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-lg font-semibold text-gray-900">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border rounded-xl mt-2"
              >
                <option value="">Select a category...</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-lg font-semibold text-gray-900">Tags (max 10)</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleTagKeyPress}
                placeholder="Press Enter to add a tag"
                className="w-full px-4 py-3 border rounded-xl"
              />
            </div>

            {/* Errors */}
            {uploadStatus === "error" && (
              <div className="bg-red-100 text-red-700 p-3 rounded-xl">{errorMessage}</div>
            )}
            {uploadStatus === "success" && (
              <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                Meme uploaded successfully! Redirecting...
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isUploading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl mt-4"
            >
              {isUploading ? "Uploading..." : "Upload Meme"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MemeUpload;
