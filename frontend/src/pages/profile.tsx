import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, FileText } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    bio: ''
  });
  
  const [errors, setErrors] = useState({});

  // Mock test users based on your database schema
  const testUsers = [
    {
      id: 1,
      username: 'memeLord2024',
      email: 'memelord@test.com',
      password: 'password123',
      bio: 'Professional meme curator 🔥'
    },
    {
      id: 2,
      username: 'dankMaster',
      email: 'dank@test.com',
      password: 'dankpass',
      bio: 'Living for the dankest memes 💀'
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isLogin) {
      // Login validation
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    } else {
      // Signup validation
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      } else if (formData.username.length > 191) {
        newErrors.username = 'Username must be less than 191 characters';
      }

      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      } else if (formData.email.length > 191) {
        newErrors.email = 'Email must be less than 191 characters';
      }

      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      if (isLogin) {
        // Mock login logic
        const user = testUsers.find(u => 
          u.email === formData.email && u.password === formData.password
        );
        
        if (user) {
          alert(`Welcome back, ${user.username}! 🎉\nRedirecting to your meme dashboard...`);
          // Here you would redirect to the main app
        } else {
          setErrors({ 
            email: 'Invalid email or password',
            password: 'Invalid email or password'
          });
        }
      } else {
        // Mock signup logic - check for existing users
        const existingEmail = testUsers.find(u => u.email === formData.email);
        const existingUsername = testUsers.find(u => u.username === formData.username);
        
        if (existingEmail) {
          setErrors({ email: 'Email already registered' });
        } else if (existingUsername) {
          setErrors({ username: 'Username already taken' });
        } else {
          alert(`Account created successfully! 🚀\nWelcome to MemePage, ${formData.username}!`);
          // Here you would create the user and redirect
        }
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const switchAuthMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      bio: ''
    });
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden backdrop-blur-lg">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black bg-opacity-10"></div>
            <div className="relative z-10">
              <div className="text-5xl mb-3">😂</div>
              <h1 className="text-3xl font-bold text-white mb-2">MemePage</h1>
              <p className="text-purple-100">
                {isLogin ? 'Welcome back, meme enthusiast!' : 'Join the meme revolution!'}
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-white opacity-20 text-2xl">🔥</div>
            <div className="absolute bottom-4 left-4 text-white opacity-20 text-xl">💀</div>
          </div>

          {/* Form Container */}
          <div className="p-8">
            <div className="space-y-6">
              
              {/* Username Field (Signup Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Your awesome username"
                      className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.username 
                          ? 'border-red-400 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-purple-500 focus:bg-purple-50'
                      }`}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.username}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="your@email.com"
                    className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.email 
                        ? 'border-red-400 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-purple-500 focus:bg-purple-50'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your password"
                    className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                      errors.password 
                        ? 'border-red-400 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-purple-500 focus:bg-purple-50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field (Signup Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onKeyPress={handleKeyPress}
                      placeholder="Confirm your password"
                      className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl focus:outline-none transition-all duration-200 ${
                        errors.confirmPassword 
                          ? 'border-red-400 focus:border-red-500 bg-red-50' 
                          : 'border-gray-200 focus:border-purple-500 focus:bg-purple-50'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-2 flex items-center">
                      <span className="mr-1">⚠️</span>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Bio Field (Signup Only) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-4 text-gray-400 w-5 h-5" />
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about your meme style..."
                      rows={3}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-purple-50 transition-all duration-200 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  <span className="flex items-center justify-center">
                    {isLogin ? (
                      <>🚀 Sign In</>
                    ) : (
                      <>✨ Create Account</>
                    )}
                  </span>
                )}
              </button>

              {/* Mode Switch */}
              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm">
                  {isLogin ? "Don't have an account yet?" : 'Already have an account?'}
                </p>
                <button
                  onClick={switchAuthMode}
                  className="text-purple-600 hover:text-purple-800 font-semibold mt-1 transition-colors"
                >
                  {isLogin ? 'Create one here! 🎯' : 'Sign in instead 👈'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Test Accounts Info */}
        <div className="mt-6 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            🧪 Test Accounts (For Development)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
              <span className="font-medium">memelord@test.com</span>
              <span className="text-gray-500">password123</span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg">
              <span className="font-medium">dank@test.com</span>
              <span className="text-gray-500">dankpass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;