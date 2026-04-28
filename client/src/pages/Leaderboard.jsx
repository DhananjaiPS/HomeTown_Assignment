import React, { useMemo, useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Sparkles,
  Gift,
  Shirt,
  Flame,
  ChevronLeft,
  ChevronRight,
  Search,
  TrendingUp,
  Target,
  PartyPopper,
  Coffee
} from 'lucide-react';

const Leaderboard = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isError } = useLeaderboard(page, 10);

  const leaderboard = data?.leaderboard || [];
  const pages = data?.pages || 1;

  const filteredLeaderboard = useMemo(() => {
    if (!searchTerm.trim()) return leaderboard;
    return leaderboard.filter((user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leaderboard, searchTerm]);

  const topThree = filteredLeaderboard.slice(0, 3);

  // Create an array for the actual podium visual order: [Rank 2, Rank 1, Rank 3]
  const top3WithRanks = topThree.map((user, idx) => ({ ...user, actualRank: idx + 1 }));
  const podiumOrder = [top3WithRanks[1], top3WithRanks[0], top3WithRanks[2]].filter(Boolean);

  const getRankMeta = (rank) => {
    if (rank === 1) {
      return {
        title: 'Champion',
        icon: <Crown size={22} className="text-yellow-600 drop-shadow-sm" />,
        gradient: 'from-yellow-300 via-amber-400 to-orange-400',
        bgSubtle: 'bg-yellow-50',
        ring: 'ring-yellow-200',
        reward: 'Gold Badge + Mini AI Hoodie'
      };
    }
    if (rank === 2) {
      return {
        title: 'Elite Performer',
        icon: <Medal size={22} className="text-slate-600 drop-shadow-sm" />,
        gradient: 'from-slate-200 via-gray-300 to-slate-400',
        bgSubtle: 'bg-slate-50',
        ring: 'ring-slate-200',
        reward: 'Silver Badge + Dev Mug'
      };
    }
    if (rank === 3) {
      return {
        title: 'Rising Star',
        icon: <Medal size={22} className="text-orange-700 drop-shadow-sm" />,
        gradient: 'from-orange-300 via-rose-400 to-orange-500',
        bgSubtle: 'bg-orange-50',
        ring: 'ring-orange-200',
        reward: 'Bronze Badge + Sticker Kit'
      };
    }
    return {
      title: 'Learner',
      icon: <Trophy size={18} className="text-blue-500" />,
      gradient: 'from-blue-400 to-blue-500',
      bgSubtle: 'bg-blue-50',
      ring: 'ring-blue-100',
      reward: 'Keep pushing for top 3'
    };
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)]" />
          <p className="font-bold text-blue-900 text-lg">Syncing Leaderboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-[2rem] border border-red-100 bg-white p-12 text-center shadow-[0_10px_40px_rgba(239,68,68,0.1)] max-w-lg mx-auto mt-20">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><Flame size={32} /></div>
        <p className="text-2xl font-black text-red-600 mb-2">Sync Failed</p>
        <p className="text-gray-500 font-medium">We couldn't load the latest rankings. Please check your connection and try again.</p>
        <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-colors">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 font-sans">

      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-gradient-to-br from-blue-50 via-white to-sky-50 px-6 py-12 text-gray-900 shadow-[0_20px_50px_-12px_rgba(37,99,235,0.15)] sm:px-10 lg:px-12">
        <div className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-[100px]" />
        <div className="absolute -bottom-32 -left-24 h-[600px] w-[600px] rounded-full bg-sky-300/20 blur-[120px]" />

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200/50 bg-white/80 backdrop-blur-sm px-5 py-2 text-sm font-bold text-blue-700 shadow-sm">
              <Sparkles size={16} className="text-blue-500" />
              Compete. Learn. Conquer.
            </div>

            <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl mb-6">
              Global Learning <br />
              <span className="bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent drop-shadow-sm">
                Leaderboard
              </span>
            </h1>

            <p className="max-w-xl text-lg leading-relaxed text-gray-600 font-medium">
              Rank is calculated using performance, assignment completion,
              and consistency. Reach the <strong className="text-blue-600">Top 3</strong> to unlock
              elite badges and exclusive merchandise.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-blue-100 bg-white/60 backdrop-blur-md p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <Trophy className="mb-3 text-blue-500" size={26} />
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Top 3 Rewards</p>
                <p className="font-black text-gray-900 text-lg mt-1">Badges + Merch</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white/60 backdrop-blur-md p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <TrendingUp className="mb-3 text-sky-500" size={26} />
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Ranking Metric</p>
                <p className="font-black text-gray-900 text-lg mt-1">Final Score</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-white/60 backdrop-blur-md p-5 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                <Flame className="mb-3 text-orange-500" size={26} />
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">The Goal</p>
                <p className="font-black text-gray-900 text-lg mt-1">Stay Consistent</p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white bg-white/80 backdrop-blur-xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.05)] transform transition-transform hover:scale-[1.02]">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-4 text-white shadow-lg shadow-blue-500/30">
                <Gift size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Why reach Top 3?</h2>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mt-1">Elite Benefits</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Rank #1', desc: 'Champion badge, premium hoodie & feature', icon: <Shirt size={18} />, color: 'text-amber-500', bg: 'bg-amber-50' },
                { title: 'Rank #2', desc: 'Elite badge, developer mug & spotlight', icon: <Coffee size={18} />, color: 'text-slate-500', bg: 'bg-slate-100' },
                { title: 'Rank #3', desc: 'Rising Star badge, official sticker kit', icon: <PartyPopper size={18} />, color: 'text-orange-500', bg: 'bg-orange-50' }
              ].map((item) => (
                <div key={item.title} className={`rounded-2xl border border-gray-100 ${item.bg} p-4 transition hover:-translate-y-0.5 hover:shadow-md`}>
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 ${item.color} bg-white p-1.5 rounded-lg shadow-sm`}>{item.icon}</div>
                    <div>
                      <p className="font-black text-gray-900">{item.title}</p>
                      <p className="text-sm text-gray-600 font-medium leading-snug mt-1">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= TRUE PODIUM SECTION FIX ================= */}
      {page === 1 && topThree.length > 0 && (
        <section className="py-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900">Hall of Fame</h2>
            <p className="text-gray-500 font-medium mt-2">The absolute best learners this month.</p>
          </div>

          {/* FIX: min-h instead of fixed h, added pt-10 to prevent crown cutting */}
          <div className="flex flex-col md:flex-row items-end justify-center gap-6 max-w-5xl mx-auto min-h-[420px] pt-10">
            {podiumOrder.map((user) => {
              const meta = getRankMeta(user.actualRank);
              const isFirst = user.actualRank === 1;

              return (
                <div
                  key={user.userId}
                  // FIX: Removed overflow-hidden to prevent clipping, used min-h
                  className={`w-full md:w-1/3 relative rounded-[2.5rem] border border-white bg-white p-6 sm:p-8 shadow-[0_15px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] flex flex-col items-center text-center ${isFirst ? 'md:min-h-[420px] md:scale-110 z-10 border-2 border-yellow-200 mb-4 md:mb-0' : 'md:min-h-[360px]'
                    }`}
                >
                  {/* Card Top Gradient Bar - Adjusted border radius */}
                  <div className={`absolute inset-x-0 top-0 h-3 rounded-t-[2.5rem] bg-gradient-to-r ${meta.gradient}`} />

                  {/* Absolute Rank Badge */}
                  <div className={`absolute top-6 right-6 rounded-full bg-gradient-to-r ${meta.gradient} px-4 py-1.5 text-sm font-black text-white shadow-lg`}>
                    #{user.actualRank}
                  </div>

                  {isFirst && <Crown size={40} className="absolute -top-12 left-1/2 -translate-x-1/2 md:top-6 md:left-6 md:translate-x-0 text-yellow-400 animate-pulse drop-shadow-md" fill="currentColor" />}

                  {/* Avatar - FIX: Added shrink-0 so flexbox doesn't make it oval */}
                  <div className={`mt-8 mb-6 flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${meta.gradient} text-4xl font-black text-white shadow-xl ring-8 ${meta.ring}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="mb-2 flex items-center justify-center gap-2">
                    {meta.icon}
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{meta.title}</p>
                  </div>

                  {/* FIX: Added leading-normal and pb-2 so letters like 'j' don't get cut */}
                  <h3 className="text-2xl font-black text-gray-900 w-full mb-6 break-words leading-normal pb-2">{user.name}</h3>

                  {/* Score Block */}
                  <div className={`w-full rounded-2xl ${meta.bgSubtle} p-4 mt-auto border border-white/50`}>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Points</p>
                    {/* FIX: Added pb-1 so numbers aren't clipped */}
                    <p className={`text-3xl font-black bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent pb-1`}>
                      {user.finalRankScore.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ================= FLOATING RANK BOARD ================= */}
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900">Rank Board</h2>
            <p className="text-base text-gray-500 font-medium">Search and track all learners.</p>
          </div>

          <div className="relative w-full sm:max-w-md group">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search learner by name..."
              className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 text-base font-medium outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100 shadow-sm"
            />
          </div>
        </div>

        <div className="hidden lg:block space-y-3">
          <div className="grid grid-cols-12 gap-4 px-8 py-3 text-xs font-black text-gray-400 uppercase tracking-widest">
            <div className="col-span-1">Rank</div>
            <div className="col-span-5">Learner Profile</div>
            <div className="col-span-2 text-center">Avg Score</div>
            <div className="col-span-2 text-center">Tasks</div>
            <div className="col-span-2 text-right">Points</div>
          </div>

          {filteredLeaderboard.length === 0 ? (
            <div className="rounded-[2rem] bg-white p-16 text-center border border-gray-100 shadow-sm">
              <Target size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900">No learner found</h3>
            </div>
          ) : (
            filteredLeaderboard.map((user, index) => {
              const rank = (page - 1) * 10 + index + 1;
              const meta = getRankMeta(rank);
              const isTop3 = rank <= 3;

              return (
                <div key={user.userId} className="group grid grid-cols-12 gap-4 items-center bg-white p-4 px-8 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.08)] hover:-translate-y-1 hover:border-blue-200">
                  <div className="col-span-1 flex items-center gap-2">
                    <span className={`font-black text-xl ${isTop3 ? 'text-gray-900' : 'text-gray-400 group-hover:text-blue-500'} transition-colors`}>#{rank}</span>
                  </div>
                  <div className="col-span-5 flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${isTop3 ? meta.gradient : 'from-blue-50 to-blue-100 text-blue-600'} font-black text-lg text-white shadow-sm ring-2 ring-transparent group-hover:ring-blue-100 transition-all`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-base">{user.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        {isTop3 && <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{meta.title}</span>}
                        {user.badges && user.badges.length > 0 && user.badges.slice(0, 3).map((badge, i) => <Award key={i} size={14} className="text-blue-400" title={badge.name} />)}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-center"><span className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-1.5 text-sm font-bold text-gray-700">{user.avgBestPercentage.toFixed(1)}%</span></div>
                  <div className="col-span-2 flex justify-center font-bold text-gray-500">{user.assignmentsAttempted}</div>
                  <div className="col-span-2 text-right"><span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{user.finalRankScore.toFixed(2)}</span></div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-4 lg:hidden">
          {filteredLeaderboard.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-center border border-gray-100 shadow-sm"><p className="text-gray-500 font-bold">No learner found.</p></div>
          ) : (
            filteredLeaderboard.map((user, index) => {
              const rank = (page - 1) * 10 + index + 1;
              const meta = getRankMeta(rank);
              const isTop3 = rank <= 3;

              return (
                <div key={user.userId} className="rounded-[2rem] border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">
                  <div className="flex items-center justify-between gap-3 mb-4 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-4">
                      <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${isTop3 ? meta.gradient : 'from-blue-50 to-blue-100 text-blue-600'} font-black text-white text-xl shadow-sm`}>{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight break-words">{user.name}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">Rank <span className={`text-base ${isTop3 ? 'text-blue-600' : 'text-gray-600'}`}>#{rank}</span></p>
                      </div>
                    </div>
                    {isTop3 && <div className="text-blue-500 bg-blue-50 p-2 rounded-full shrink-0">{meta.icon}</div>}
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center mb-2">
                    <div className="rounded-2xl bg-gray-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Avg</p><p className="font-black text-gray-900 text-lg">{user.avgBestPercentage.toFixed(0)}%</p></div>
                    <div className="rounded-2xl bg-gray-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Tasks</p><p className="font-black text-gray-900 text-lg">{user.assignmentsAttempted}</p></div>
                    <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3 shadow-inner"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-500">Points</p><p className="font-black text-blue-700 text-lg">{user.finalRankScore.toFixed(1)}</p></div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {pages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4 sm:gap-6">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="flex items-center gap-2 px-5 py-3 sm:px-6 bg-white border border-gray-200 rounded-full text-blue-600 font-bold shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:shadow-md disabled:opacity-40 transition-all active:scale-95 group"><ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> <span className="hidden sm:inline">Previous</span></button>
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"><span className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black shadow-md">{page}</span><span className="text-gray-400 font-bold text-sm px-1">of</span><span className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 font-bold">{pages}</span></div>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="flex items-center gap-2 px-5 py-3 sm:px-6 bg-white border border-gray-200 rounded-full text-blue-600 font-bold shadow-sm hover:bg-blue-50 hover:border-blue-200 hover:shadow-md disabled:opacity-40 transition-all active:scale-95 group"><span className="hidden sm:inline">Next</span> <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Leaderboard;