import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { BookOpen, Trophy, Target, Award, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, colorClass }) => (
  <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
    <div className={`p-4 rounded-lg ${colorClass}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  if (isError) return <div className="text-red-500 text-center py-12">Failed to load dashboard.</div>;

  const { stats, badges, recentActivity, recentSubmissions } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Here's your learning progress summary.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Avg. Score" 
          value={`${stats.totalMaxScore > 0 ? ((stats.totalScore / stats.totalMaxScore) * 100).toFixed(1) : 0}%`} 
          icon={<Target size={24} className="text-blue-600" />} 
          colorClass="bg-blue-100" 
        />
        <StatCard 
          title="Assignments Done" 
          value={stats.assignmentsAttempted} 
          icon={<BookOpen size={24} className="text-green-600" />} 
          colorClass="bg-green-100" 
        />
        <StatCard 
          title="Current Streak" 
          value={`${stats.currentStreak} Days`} 
          icon={<Clock size={24} className="text-orange-600" />} 
          colorClass="bg-orange-100" 
        />
        <StatCard 
          title="Badges Earned" 
          value={badges.length} 
          icon={<Award size={24} className="text-purple-600" />} 
          colorClass="bg-purple-100" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><BookOpen size={20}/> Recent Submissions</h2>
            {recentSubmissions.length === 0 ? (
              <p className="text-gray-500">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {recentSubmissions.map(sub => (
                  <div key={sub._id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-semibold text-foreground">{sub.assignmentId?.title || 'Unknown Assignment'}</p>
                      <p className="text-sm text-gray-500">{new Date(sub.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-primary">{sub.percentage.toFixed(1)}%</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${sub.status === 'evaluated' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
               <Link to="/articles" className="text-primary hover:underline text-sm font-medium">Browse more articles &rarr;</Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Award size={20}/> My Badges</h2>
            {badges.length === 0 ? (
              <p className="text-gray-500 text-sm">Earn badges by completing assignments and keeping up your streak!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((b, i) => (
                  <div key={i} className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
                    <Trophy size={14} /> {b.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Activity Feed</h2>
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map(act => (
                  <div key={act._id} className="relative pl-4 border-l-2 border-blue-200">
                    <div className="absolute w-2 h-2 bg-blue-500 rounded-full -left-[5px] top-1.5"></div>
                    <p className="text-sm font-medium text-foreground">{act.title}</p>
                    <p className="text-xs text-gray-500">{act.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
