import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
  const navigate = useNavigate();

  // Check auth status on load
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await checkAuthStatus();
        if (res.success && res.user) setUser(res.user);
        else setUser(null);
      } catch (err) {
        console.error(err);
        setUser(null);
      }
    };
    initAuth();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "meme_user" || e.key === "auth_token") initAuth();
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setUser(null);
      navigate("/");
      window.dispatchEvent(new CustomEvent("authChange"));
    } catch (err) {
      console.error(err);
      setUser(null);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAvatar = () => {
    return user?.username?.charAt(0).toUpperCase() || "U";
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-4 py-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="h-10 w-auto" />
          <span className="text-white font-extrabold text-xl hidden md:block">MemeHub</span>
        </Link>

        {/* Desktop menu */}
        <div className="hidden sm:flex items-center gap-4">
          <Link to="/explore" className="text-white font-semibold">Explore</Link>
          <Link to="/category" className="text-white font-semibold">Categories</Link>

          {user ? (
            <>
              <Link
                to="/upload"
                className="text-white font-semibold px-3 py-1 rounded hover:bg-white hover:bg-opacity-20"
              >
                <Upload className="inline w-4 h-4 mr-1" /> Upload
              </Link>

              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-2 rounded-full text-white"
                >
                  {user.profile_pic ? (
                    <img src={user.profile_pic} alt="Profile" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                      {getUserAvatar()}
                    </div>
                  )}
                  <span>{user.username}</span>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg overflow-hidden">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <UserCircle className="inline w-4 h-4 mr-2" /> My Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => setIsProfileDropdownOpen(false)}
                    >
                      <Settings className="inline w-4 h-4 mr-2" /> Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/profile"
              className="bg-white text-orange-600 font-semibold px-4 py-2 rounded-full hover:bg-gray-100"
            >
              Login / Sign Up
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden text-white p-2 rounded-md hover:bg-white hover:bg-opacity-20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden mt-2 bg-white rounded-lg shadow-md p-4 flex flex-col gap-2">
          <Link to="/explore" className="block" onClick={() => setIsMenuOpen(false)}>Explore</Link>
          <Link to="/category" className="block" onClick={() => setIsMenuOpen(false)}>Categories</Link>
          {user ? (
            <>
              <Link to="/upload" className="block" onClick={() => setIsMenuOpen(false)}>Upload</Link>
              <Link to="/profile" className="block" onClick={() => setIsMenuOpen(false)}>My Profile</Link>
              <Link to="/settings" className="block" onClick={() => setIsMenuOpen(false)}>Settings</Link>
              <button onClick={handleLogout} className="text-red-600">Logout</button>
            </>
          ) : (
            <Link to="/profile" className="block" onClick={() => setIsMenuOpen(false)}>Login / Sign Up</Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
