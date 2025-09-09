import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { 
  UserCircle, 
  LogOut, 
  Settings, 
  Upload,
  Sparkles
} from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Refs for click outside detection
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced auth check with immediate sync
  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();
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

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "meme_user" || e.key === "auth_token") {
        checkAuth(true);
      }
    };

    const handleAuthChange = () => checkAuth(true);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAuth(true);
      }
    };

    const handleHashChange = () => checkAuth(true);
    const handleLocationChange = () => {
      setTimeout(() => checkAuth(true), 100);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

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
      setIsAnimating(true);
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
      setIsAnimating(false);
    }
  };

  const getUserAvatar = () => {
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsProfileDropdownOpen(false);
  };

  const handleProfileToggle = () => {
    setIsProfileDropdownOpen(!isProfileDropdownOpen);
    setIsMenuOpen(false);
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const isCurrentPath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-blue-950/95 backdrop-blur-md shadow-lg h-16' 
          : 'bg-blue-950/95 backdrop-blur-md shadow-lg h-16'
      } px-4`}>
        <div className="container mx-auto flex items-center justify-between">
          {/* Enhanced Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 group transition-all duration-300 hover:scale-110"
            onClick={closeMenus}
          >
            <div className="relative">
              <img 
                src={logo} 
                alt="Logo" 
                className={`transition-all duration-500 group-hover:rotate-12 ${
                  scrolled ? 'h-8 w-auto' : 'h-10 w-auto'
                }`}
              />
              <div className="absolute inset-0 bg-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="relative">
              <span className={`text-white font-extrabold transition-all duration-500 hidden md:block group-hover:text-yellow-100 ${
                scrolled ? 'text-lg' : 'text-xl'
              }`}>
                MemeHub
              </span>
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-200 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
            </div>
          </Link>

          {/* Enhanced Desktop menu */}
          <div className="hidden sm:flex items-center gap-6">
            <Link 
              to="/explore" 
              className={`relative text-white font-semibold py-2 transition-all duration-300 hover:text-yellow-100 group transform hover:scale-105 ${
                isCurrentPath('/explore') ? 'text-yellow-100' : ''
              }`}
              onClick={closeMenus}
            >
              Explore
              <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-100 transition-all duration-300 ${
                isCurrentPath('/explore') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>
            
            <Link 
              to="/category" 
              className={`relative text-white font-semibold py-2 transition-all duration-300 hover:text-yellow-100 group transform hover:scale-105 ${
                isCurrentPath('/category') ? 'text-yellow-100' : ''
              }`}
              onClick={closeMenus}
            >
              Categories
              <span className={`absolute bottom-0 left-0 h-0.5 bg-yellow-100 transition-all duration-300 ${
                isCurrentPath('/category') ? 'w-full' : 'w-0 group-hover:w-full'
              }`}></span>
            </Link>

            {user ? (
              <>
                <Link
                  to="/upload"
                  className="relative text-white font-semibold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center gap-2 group backdrop-blur-sm"
                  onClick={closeMenus}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500 rounded-xl"></div>
                  <Upload className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  <span className="hidden lg:inline relative z-10">Upload</span>
                </Link>

                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={handleProfileToggle}
                    disabled={isLoading}
                    className={`flex items-center gap-3 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full text-white hover:bg-white/25 transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed group ${
                      isAnimating ? 'animate-pulse' : ''
                    }`}
                  >
                    {user.profile_pic ? (
                      <img 
                        src={user.profile_pic} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full border-2 border-white/50 transition-all duration-300 group-hover:border-white group-hover:shadow-lg" 
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white/50 transition-all duration-300 group-hover:border-white group-hover:shadow-lg group-hover:from-indigo-400 group-hover:to-purple-500">
                        <span className="text-sm font-bold">{getUserAvatar()}</span>
                      </div>
                    )}
                    <span className="font-medium hidden md:block group-hover:text-yellow-100 transition-colors duration-300">
                      {user.username}
                    </span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Enhanced dropdown */}
                  <div className={`absolute right-0 mt-3 w-56 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 transform border border-white/20 ${
                    isProfileDropdownOpen 
                      ? 'opacity-100 scale-100 translate-y-0' 
                      : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
                  }`}>
                    <div className="py-3">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 text-gray-700 hover:text-gray-900 rounded-xl mx-2 my-1 group"
                        onClick={closeMenus}
                      >
                        <UserCircle className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                        <span className="font-medium">My Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-3 px-5 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-300 text-gray-700 hover:text-gray-900 rounded-xl mx-2 my-1 group"
                        onClick={closeMenus}
                      >
                        
                      </Link>
                      <hr className="my-2 mx-4" />
                      <button
                        onClick={handleLogout}
                        disabled={isLoading}
                        className="w-full flex items-center gap-3 px-5 py-3 text-red-600 hover:bg-red-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl mx-2 mb-2 group"
                      >
                        <LogOut className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'group-hover:rotate-12'} transition-transform duration-300`} />
                        <span className="font-medium">{isLoading ? 'Logging out...' : 'Logout'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <Link
                to="/profile"
                className="bg-white text-orange-600 font-semibold px-6 py-2 rounded-full hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 relative overflow-hidden group"
                onClick={closeMenus}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-400/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                <span className="relative z-10">Login / Sign Up</span>
              </Link>
            )}
          </div>

          {/* Enhanced mobile menu button */}
          <button
            onClick={handleMenuToggle}
            className="sm:hidden text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-110 hover:shadow-lg"
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

        {/* Enhanced mobile menu */}
        <div 
          ref={mobileMenuRef}
          className={`sm:hidden overflow-hidden transition-all duration-500 ease-out ${
            isMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-5 space-y-1 border border-white/20">
            <Link 
              to="/explore" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                isCurrentPath('/explore') 
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-lg' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={closeMenus}
            >
              Explore
            </Link>
            <Link 
              to="/category" 
              className={`block py-3 px-4 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 ${
                isCurrentPath('/category') 
                  ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-lg' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={closeMenus}
            >
              Categories
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/upload" 
                  className="flex items-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 transition-all duration-300 font-medium text-purple-700 transform hover:scale-105 border border-purple-200"
                  onClick={closeMenus}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </Link>
                <hr className="my-3" />
                <Link 
                  to="/profile" 
                  className="flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium text-gray-700 transform hover:scale-105 group"
                  onClick={closeMenus}
                >
                  <UserCircle className="w-4 h-4 transition-transform duration-500" />
                  My Profile
                </Link>
                <Link 
                  to="/settings" 
                  className={`flex items-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 font-medium transform hover:scale-105 group ${
                    isCurrentPath('/settings') 
                      ? 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 shadow-lg' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                  onClick={closeMenus}
                >
                  <Settings className="w-4 h-4 transition-transform duration-500" />
                  Settings
                </Link>
                <button 
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="flex items-center gap-2 w-full py-3 px-4 rounded-xl text-red-600 hover:bg-red-50 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 group"
                >
                  <LogOut className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''} transition-transform duration-500`} />
                  {isLoading ? 'Logging out...' : 'Logout'}
                </button>
              </>
            ) : (
              <Link 
                to="/profile" 
                className="block py-3 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-center transform hover:scale-105 shadow-lg"
                onClick={closeMenus}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from hiding behind fixed nav */}
      <div className={`transition-all duration-500 ${scrolled ? 'h-16' : 'h-20'}`}></div>
    </>
  );
};

export default Header;