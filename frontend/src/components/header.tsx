import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { UserCircle, LogOut, Settings, Upload } from "lucide-react";
import { logout, checkAuthStatus } from "../api/userApi";
import logo from "../assets/logo.png";

interface User {
  id: number;
  username: string;
  email: string;
  bio?: string;
  profile_pic?: string;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAuthCheck, setLastAuthCheck] = useState(Date.now());
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Enhanced auth check with immediate sync
  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();
    // Only check auth every 10 seconds unless forced (reduced from 30s for better sync)
    if (!force && now - lastAuthCheck < 10000) return;
    
    try {
      const res = await checkAuthStatus();
      if (res.success && res.user) {
        setUser(res.user);
        setLastAuthCheck(now);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
    }
  }, [lastAuthCheck]);

  // Watch for location changes to trigger auth check
  useEffect(() => {
    checkAuth(true);
  }, [location.pathname, checkAuth]);

  // Initial auth check and event listeners
  useEffect(() => {
    checkAuth(true);

    // Enhanced storage change handler
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "meme_user" || e.key === "auth_token") {
        checkAuth(true);
      }
    };

    // Custom auth change event listener
    const handleAuthChange = () => checkAuth(true);
    
    // Focus/visibility change handler for real-time sync
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth(true);
      }
    };

    // Listen for hash changes and URL changes for SPA routing
    const handleHashChange = () => checkAuth(true);
    const handleLocationChange = () => {
      // Small delay to allow other components to update first
      setTimeout(() => checkAuth(true), 100);
    };

    // Click outside handler for dropdowns
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Custom event for login/signup success
    const handleLoginSuccess = () => {
      setTimeout(() => checkAuth(true), 200);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("authChange", handleAuthChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("beforeunload", handleLocationChange);
    window.addEventListener("loginSuccess", handleLoginSuccess);

    // Periodic auth check for real-time sync (reduced to 30 seconds)
    const interval = setInterval(() => checkAuth(), 30000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("beforeunload", handleLocationChange);
      window.removeEventListener("loginSuccess", handleLoginSuccess);
      clearInterval(interval);
    };
  }, [checkAuth]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setUser(null);
      setIsProfileDropdownOpen(false);
      setIsMenuOpen(false);
      navigate("/");
      window.dispatchEvent(new CustomEvent("authChange"));
    } catch (err) {
      console.error('Logout failed:', err);
      setUser(null);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAvatar = () => {
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileDropdownOpen(false); // Close profile dropdown when mobile menu opens
  };

  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsMenuOpen(false); // Close mobile menu when profile dropdown opens
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-4 py-3 shadow-lg backdrop-blur-sm">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo with hover effect */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group transition-transform duration-200 hover:scale-105"
          onClick={closeMenus}
        >
          <img 
            src={logo} 
            alt="Logo" 
            className="h-10 w-auto transition-transform duration-200 group-hover:rotate-12" 
          />
          <span className="text-white font-extrabold text-xl hidden md:block group-hover:text-yellow-100 transition-colors duration-200">
            MemeHub
          </span>
        </Link>

        {/* Desktop menu with enhanced hover effects */}
        <div className="hidden sm:flex items-center gap-6">
          <Link 
            to="/explore" 
            className="relative text-white font-semibold py-2 transition-all duration-300 hover:text-yellow-100 group"
            onClick={closeMenus}
          >
            Explore
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-100 transition-all duration-300 group-hover:w-full"></span>
          </Link>
          
          <Link 
            to="/category" 
            className="relative text-white font-semibold py-2 transition-all duration-300 hover:text-yellow-100 group"
            onClick={closeMenus}
          >
            Categories
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-100 transition-all duration-300 group-hover:w-full"></span>
          </Link>

          {user ? (
            <>
              <Link
                to="/upload"
                className="relative text-white font-semibold px-4 py-2 rounded-lg hover:bg-opacity-20 transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-2 group"
                onClick={closeMenus}
              >
                <Upload className="w-4 h-4" />
                <span className="hidden lg:inline">Upload</span>
                <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-yellow-100 transition-all duration-300 group-hover:w-3/4"></span>
              </Link>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={handleProfileToggle}
                  disabled={isLoading}
                  className="flex items-center gap-3 bg-white bg-opacity-20 px-4 py-2 rounded-full text-white hover:bg-opacity-30 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {user.profile_pic ? (
                    <img 
                      src={user.profile_pic} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border-2 border-white border-opacity-50 transition-transform duration-300 hover:border-opacity-100" 
                    />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center border-2 border-white border-opacity-50 transition-all duration-300 hover:border-opacity-100 hover:bg-indigo-400">
                      <span className="text-sm font-bold">{getUserAvatar()}</span>
                    </div>
                  )}
                  <span className="font-medium hidden md:block">{user.username}</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Enhanced dropdown with animations and more rounded corners */}
                <div className={`absolute right-0 mt-3 w-56 bg-white shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 transform ${
                  isProfileDropdownOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="py-3">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors duration-200 text-gray-700 hover:text-gray-900 rounded-lg mx-2 my-1"
                      onClick={closeMenus}
                    >
                      <UserCircle className="w-4 h-4" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors duration-200 text-gray-700 hover:text-gray-900 rounded-lg mx-2 my-1"
                      onClick={closeMenus}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 mx-4" />
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg mx-2 mb-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{isLoading ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <Link
              to="/profile"
              className="bg-white text-orange-600 font-semibold px-6 py-2 rounded-full hover:bg-gray-50 hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              onClick={closeMenus}
            >
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Enhanced mobile menu button */}
        <button
          onClick={handleMenuToggle}
          className="sm:hidden text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-all duration-300 transform hover:scale-110"
        >
          <svg className="w-6 h-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              className="transition-all duration-300"
            />
          </svg>
        </button>
      </div>

      {/* Enhanced mobile menu with animations */}
      <div 
        ref={mobileMenuRef}
        className={`sm:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="mt-3 bg-white rounded-2xl shadow-xl p-5 space-y-1">
          <Link 
            to="/explore" 
            className="block py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-medium"
            onClick={closeMenus}
          >
            Explore
          </Link>
          <Link 
            to="/category" 
            className="block py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-medium"
            onClick={closeMenus}
          >
            Categories
          </Link>
          
          {user ? (
            <>
              <Link 
                to="/upload" 
                className="flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={closeMenus}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Link>
              <hr className="my-3" />
              <Link 
                to="/profile" 
                className="flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={closeMenus}
              >
                <UserCircle className="w-4 h-4" />
                My Profile
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 font-medium"
                onClick={closeMenus}
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <button 
                onClick={handleLogout}
                disabled={isLoading}
                className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogOut className="w-4 h-4" />
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <Link 
              to="/profile" 
              className="block py-3 px-4 rounded-xl bg-orange-50 text-orange-600 font-semibold hover:bg-orange-100 transition-colors duration-200"
              onClick={closeMenus}
            >
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;