import React, { useState } from 'react';
import { useAdminDashboard } from '../hooks/useDashboard';
import { Users, FileText, FileQuestion, UploadCloud } from 'lucide-react';
import AdminArticles from '../components/admin/AdminArticles';
import AdminAssignments from '../components/admin/AdminAssignments';
import AdminAuthorRequests from '../components/admin/AdminAuthorRequests';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-lg ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold">{value ?? 0}</h3>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { data, isLoading, isError } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Failed to load admin stats.</div>;
  }

  const stats = data?.data || data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={stats?.totalUsers} icon={<Users size={24} className="text-blue-600" />} colorClass="bg-blue-100" />
        <StatCard title="Articles" value={stats?.totalArticles} icon={<FileText size={24} className="text-green-600" />} colorClass="bg-green-100" />
        <StatCard title="Assignments" value={stats?.totalAssignments} icon={<FileQuestion size={24} className="text-purple-600" />} colorClass="bg-purple-100" />
        <StatCard title="Submissions" value={stats?.totalSubmissions} icon={<UploadCloud size={24} className="text-orange-600" />} colorClass="bg-orange-100" />
      </div>

      <div className="bg-card p-6 rounded-xl border border-border">
        <h2 className="text-xl font-bold mb-4">
          Platform Average Score: {(stats?.avgScore ?? 0).toFixed(1)}%
        </h2>
        <p className="text-gray-500">
          This is the average percentage score across all submitted assignments.
        </p>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const isAuthor = user?.role === 'author';
  
  // Define available tabs based on role
  const tabs = [];
  if (isAdmin) tabs.push('dashboard');
  tabs.push('articles', 'assignments');
  if (isAdmin) tabs.push('requests');

  const [activeTab, setActiveTab] = useState(isAdmin ? 'dashboard' : 'articles');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isAdmin ? 'Admin Portal' : 'Author Studio'}
        </h1>
        <p className="text-gray-500 mt-1">
          {isAdmin ? 'Manage platform content and analytics.' : 'Create and manage your educational content.'}
        </p>
      </div>

      <div className="flex border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 font-medium whitespace-nowrap ${activeTab === tab
              ? 'border-b-2 border-primary text-primary'
              : 'text-gray-500 hover:text-gray-700'
              }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'dashboard' ? 'Analytics' : 
             tab === 'requests' ? 'Author Requests' :
             tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div>
        {activeTab === 'dashboard' && <AdminDashboard />}
        {activeTab === 'articles' && <AdminArticles />}
        {activeTab === 'assignments' && <AdminAssignments />}
        {activeTab === 'requests' && <AdminAuthorRequests />}
      </div>
    </div>
  );
};

export default AdminPanel;