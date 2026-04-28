import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogOut,
  LayoutDashboard,
  Trophy,
  Shield,
  Sparkles,
  Menu,
  X,
  BookText
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link to="/dashboard" className="nav-link">
        <LayoutDashboard size={18} /> <span>Dashboard</span>
      </Link>
      <Link to="/articles" className="nav-link">
        <BookText size={18} /> <span>Articles</span>
      </Link>
      <Link to="/leaderboard" className="nav-link">
        <Trophy size={18} /> <span>Leaderboard</span>
      </Link>
      {user?.role === 'admin' && (
        <Link to="/admin" className="nav-link text-orange-500">
          <Shield size={18} /> <span>Admin</span>
        </Link>
      )}
    </>
  );

  return (
    <nav className="bg-white/80 backdrop-blur border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex justify-between h-16 items-center">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-white p-2 rounded-xl shadow">
            <BookText size={22} />
          </div>
          <span className="text-xl font-bold text-gray-800">
            Mini AI LMS
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <NavLinks />

              {/* AI Tokens */}
              {user.stats && (
                <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>
                    {(user.stats.aiTokensUsed || 0)} / {(user.stats.aiTokensLimit || 10000)}
                  </span>
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-red-500 hover:text-red-600"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-medium">Login</Link>
              <Link to="/signup" className="bg-primary text-white px-4 py-2 rounded-lg">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 space-y-4 shadow-lg">
          {user ? (
            <>
              <NavLinks mobile />

              {user.stats && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <Sparkles size={14} />
                  Tokens: {user.stats.aiTokensUsed} / {user.stats.aiTokensLimit}
                </div>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-500"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="block bg-primary text-white px-4 py-2 rounded-lg">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      {/* Tailwind helper */}
      <style jsx>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-weight: 500;
          transition: 0.2s;
        }
        .nav-link:hover {
          color: #2563eb;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;