import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BookOpen, LayoutDashboard, Trophy, Shield, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <BookOpen size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                Mini AI LMS
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <LayoutDashboard size={18} /> <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link to="/articles" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <BookOpen size={18} /> <span className="hidden sm:inline">Articles</span>
                </Link>
                <Link to="/leaderboard" className="text-foreground hover:text-primary transition-colors flex items-center gap-1">
                  <Trophy size={18} /> <span className="hidden sm:inline">Leaderboard</span>
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1">
                    <Shield size={18} /> <span className="hidden sm:inline">Admin</span>
                  </Link>
                )}
                
                {/* AI Quota Widget */}
                {user.stats && (
                  <div className="hidden lg:flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-blue-200 mx-1" title={`AI Tokens Used: ${user.stats.aiTokensUsed || 0} / ${user.stats.aiTokensLimit || (user.role === 'admin' ? 100000 : 10000)}`}>
                    <Sparkles size={14} className="text-blue-500 animate-pulse" />
                    <span>
                      {user.stats.aiTokensUsed > 1000 ? (user.stats.aiTokensUsed / 1000).toFixed(1) + 'k' : (user.stats.aiTokensUsed || 0)} / {user.stats.aiTokensLimit > 1000 ? (user.stats.aiTokensLimit / 1000).toFixed(0) + 'k' : (user.stats.aiTokensLimit || (user.role === 'admin' ? 100000 : 10000))}
                    </span>
                  </div>
                )}
                <div className="h-6 w-px bg-border mx-2"></div>
                <button 
                  onClick={handleLogout}
                  className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                >
                  <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-foreground hover:text-primary transition-colors font-medium">Login</Link>
                <Link to="/signup" className="bg-primary hover:bg-blue-600 text-primary-foreground px-4 py-2 rounded-md font-medium transition-colors">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
