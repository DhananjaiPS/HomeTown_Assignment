import React from 'react';
import { Trophy, Medal, Crown } from 'lucide-react';

export const getRankMeta = (rank) => {
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
