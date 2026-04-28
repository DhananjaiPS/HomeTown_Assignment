import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import { Sparkles, Brain, Trophy, ArrowRight, Zap, Shield, BookOpen } from 'lucide-react';

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />

      <main className="flex-1 w-full flex flex-col">
        {/* HERO SECTION */}
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50 to-white pt-24 pb-32 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 blur-3xl rounded-full mix-blend-multiply animate-pulse"></div>
          </div>
          
          <div className="relative max-w-5xl mx-auto text-center z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-8 animate-fade-in-up">
              <Sparkles size={16} className="text-blue-500" />
              <span>Next-Generation AI Learning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
              Master new skills with <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Intelligent Guidance
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Mini AI LMS transforms how you learn. Read premium articles, tackle interactive assignments, and get real-time AI hints when you're stuck.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group text-lg"
                >
                  Go to Dashboard
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link 
                    to="/signup" 
                    className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group text-lg"
                  >
                    Start Learning Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link 
                    to="/login" 
                    className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-gray-50 text-gray-800 font-bold border border-gray-200 rounded-xl shadow-sm transition-all flex items-center justify-center text-lg"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="py-24 bg-white px-4 sm:px-6 lg:px-8 border-t border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Supercharge your learning workflow</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to consume knowledge faster and retain it longer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI Magic Summaries</h3>
                <p className="text-gray-600 leading-relaxed">
                  Too long to read? Our custom AI engine extracts the most critical information from any article instantly, saving you hours of reading time.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligent Hints</h3>
                <p className="text-gray-600 leading-relaxed">
                  Stuck on a tricky assignment question? Ask the AI for a gentle nudge. It guides you to the answer without solving it for you.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Trophy size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Global Leaderboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Compete with learners worldwide. Climb the ranks by maintaining high accuracy and completing assignments efficiently.
                </p>
              </div>
            </div>
          </div>
        </section>
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
