import React, { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Trophy, Medal, Award } from 'lucide-react';

const Leaderboard = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useLeaderboard(page, 10);

  if (isLoading) return <div className="flex justify-center py-12"><div className="loader"></div></div>;
  if (isError) return <div className="text-red-500 text-center py-12">Failed to load leaderboard.</div>;

  const { leaderboard, pages } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center bg-yellow-100 text-yellow-600 p-4 rounded-full mb-4">
          <Trophy size={40} />
        </div>
        <h1 className="text-4xl font-bold text-foreground">Global Leaderboard</h1>
        <p className="text-gray-500 mt-2">Compete with learners worldwide. Ranked by a combined score of performance and completion rate.</p>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-border">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Rank</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Learner</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Avg Score</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Assignments</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Final Rank Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {leaderboard.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No data available yet.</td>
                </tr>
              ) : (
                leaderboard.map((user, index) => {
                  const rank = (page - 1) * 10 + index + 1;
                  return (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {rank === 1 && <Medal className="text-yellow-500 mr-2" size={20} />}
                          {rank === 2 && <Medal className="text-gray-400 mr-2" size={20} />}
                          {rank === 3 && <Medal className="text-amber-600 mr-2" size={20} />}
                          <span className={`font-bold ${rank <= 3 ? 'text-lg' : 'text-gray-600'}`}>#{rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{user.name}</p>
                            <div className="flex gap-1 mt-1">
                              {user.badges && user.badges.slice(0, 3).map((b, i) => (
                                <Award key={i} size={14} className="text-yellow-500" title={b.name} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        {user.avgBestPercentage.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {user.assignmentsAttempted}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        {user.finalRankScore.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {pages > 1 && (
          <div className="px-6 py-4 border-t border-border flex justify-between items-center bg-gray-50">
            <button 
              disabled={page === 1} 
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">Page {page} of {pages}</span>
            <button 
              disabled={page === pages} 
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 border rounded-md disabled:opacity-50 hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
