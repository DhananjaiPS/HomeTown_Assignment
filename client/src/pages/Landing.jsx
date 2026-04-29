import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Sparkles, Brain, Trophy, ArrowRight, Zap, Shield, BookOpen, Feather } from 'lucide-react';
import Features from '../components/ui/Features';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[90vh] pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-slate-950 flex items-center justify-center">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-40 bg-no-repeat z-0"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1932&auto=format&fit=crop')",
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-450/90 via-slate-900/80 to-slate-550" />

          {/* Glow */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[420px] bg-blue-500/30 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-purple-500/20 blur-3xl rounded-full pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-blue-200 font-semibold text-sm mb-8 border border-white/10 backdrop-blur">
              <Sparkles size={16} className="text-blue-300" />
              <span>Next-Generation AI Learning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
              Master new skills with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-purple-300">
                Intelligent Guidance
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
              Mini AI LMS helps you read smarter, practice faster, and improve with AI-powered hints, summaries, and real-time performance insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group text-lg"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group text-lg"
                  >
                    Start Learning Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    to="/login"
                    className="w-full sm:w-auto px-8 py-4 bg-white/20 hover:bg-white/30 text-white font-bold border border-white/30 rounded-xl backdrop-blur transition-all flex items-center justify-center text-lg mt-2 sm:mt-0 shadow-lg"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
        {/* FEATURES SECTION */}
        <Features />

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <BookOpen size={20} />
              </div>
              <span className="text-xl font-bold text-white">Mini AI LMS</span>
            </Link>
            <p className="text-gray-400 max-w-xs leading-relaxed">
              Empowering the next generation of learners with artificial intelligence and gamified education.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/articles" className="hover:text-blue-400 transition-colors">Articles</Link></li>
              <li><Link to="/leaderboard" className="hover:text-blue-400 transition-colors">Leaderboard</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors">Log In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-800 text-sm text-gray-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Mini AI LMS. All rights reserved.</p>
          <div className="flex items-center gap-1 mt-4 md:mt-0">
            <span>Secured with</span>
            <Shield size={14} className="text-green-500" />
            <span>Bank-grade encryption</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
