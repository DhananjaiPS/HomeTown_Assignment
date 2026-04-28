import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Layout from './components/layout/Layout';
import { ProtectedRoute, AdminRoute } from './routes/ProtectedRoute';

import Dashboard from './pages/Dashboard';
import Leaderboard from './pages/Leaderboard';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';
import AdminPanel from './pages/Admin';
import Profile from './pages/Profile';

import Landing from './pages/Landing';

// Placeholders for remaining pages

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
        <Route path="/articles" element={<ProtectedRoute><Layout><ArticleList /></Layout></ProtectedRoute>} />
        <Route path="/articles/:slug" element={<ProtectedRoute><Layout><ArticleDetail /></Layout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
        
        <Route path="/admin/*" element={<AdminRoute><Layout><AdminPanel /></Layout></AdminRoute>} />
      </Routes>
    </>
  );
}

export default App;
