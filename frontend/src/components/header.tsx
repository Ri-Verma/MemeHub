import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png"; // ensure logo exists

interface User {
  firstName: string;
  isLoggedIn: boolean;
}

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Simulate auth (replace with actual logic)
  useEffect(() => {
    const mockUser = {
      firstName: "John",
      isLoggedIn: false,
    };
    setUser(mockUser);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-blend-color-burn bg-yellow-500/80 backdrop-blur-md px-4 py-3 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="MemeHub Logo" className="h-10 w-auto" />
          <span className="hidden md:block font-extrabold text-white text-xl tracking-wide">
            MemeHub
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center space-x-8">
          <NavLink to="/explore" label="Explore" />
          <NavLink to="/category" label="Category" />

          {user?.isLoggedIn ? (
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg cursor-pointer border-2 border-white shadow-md">
                {user.firstName[0]}
              </div>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition">
                <Link
                  to="../pages/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <NavLink to="../pages/profile" label="Login / Signup" />
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="sm:hidden text-white focus:outline-none"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="sm:hidden mt-3 bg-white rounded-lg shadow-lg p-4 space-y-2 animate-fadeIn">
          <Link className="block text-gray-800 font-medium hover:text-yellow-500" to="/explore">
            Explore
          </Link>
          <Link className="block text-gray-800 font-medium hover:text-yellow-500" to="/category">
            Category
          </Link>
          {user?.isLoggedIn ? (
            <>
              <Link className="block text-gray-800 font-medium hover:text-yellow-500" to="../pages/profile">
                Profile
              </Link>
              <button className="w-full text-left text-gray-800 font-medium hover:text-yellow-500">
                Logout
              </button>
            </>
          ) : (
            <Link className="block text-gray-800 font-medium hover:text-yellow-500" to="../pages/profile">
              Login / Signup
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

// ✅ Reusable nav link with modern underline hover effect
const NavLink = ({ to, label }: { to: string; label: string }) => (
  <Link
    to={to}
    className="relative text-white font-semibold tracking-wide text-lg after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-white after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full"
  >
    {label}
  </Link>
);

export default Header;
