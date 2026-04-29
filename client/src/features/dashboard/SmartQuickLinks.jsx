import React from 'react';
import { useAdaptiveRecommendations } from '../../hooks/useAdaptiveAI';
import { Link } from 'react-router-dom';
import {
  Play,
  BookOpen,
  TrendingUp,
  Zap,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const iconMap = {
  Play,
  BookOpen,
  TrendingUp,
  Zap
};

const SmartQuickLinks = () => {
  const { data, isLoading } = useAdaptiveRecommendations();

  const links = Array.isArray(data) ? data : data?.links || [];

  if (isLoading) {
    return (
      <div className="h-48 animate-pulse rounded-xl border border-blue-100 bg-blue-50 p-6" />
    );
  }

  if (!links.length) {
    return (
      <div className="rounded-xl border border-blue-100 bg-white p-6 text-center shadow-sm">
        <AlertCircle className="mx-auto mb-2 text-gray-400" size={24} />
        <h3 className="font-bold text-gray-900">Smart Actions</h3>
        <p className="mt-1 text-sm text-gray-500">
          Complete articles and assignments to unlock personalized actions.
        </p>
      </div>
    );
  }

  const getStyle = (type) => {
    if (type === 'weakness') {
      return {
        bg: 'bg-orange-50 hover:bg-orange-100',
        text: 'text-orange-700',
        icon: 'text-orange-500',
        border: 'hover:border-orange-100'
      };
    }

    if (type === 'quick') {
      return {
        bg: 'bg-green-50 hover:bg-green-100',
        text: 'text-green-700',
        icon: 'text-green-500',
        border: 'hover:border-green-100'
      };
    }

    return {
      bg: 'bg-blue-50 hover:bg-blue-100',
      text: 'text-blue-700',
      icon: 'text-blue-500',
      border: 'hover:border-blue-100'
    };
  };

  return (
    <div className="h-full rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-black text-gray-900">
        <Zap size={20} className="text-blue-500" />
        Smart Actions
      </h3>

      <div className="space-y-3">
        {links.map((link, index) => {
          const IconComponent = iconMap[link?.icon] || Play;
          const style = getStyle(link?.type);

          return (
            <Link
              key={link?.id || `${link?.title}-${index}`}
              to={link?.action || '/dashboard'}
              className={`group flex items-center justify-between rounded-xl border border-transparent p-3 transition-all hover:-translate-y-0.5 hover:shadow-sm ${style.bg} ${style.border}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className={`shrink-0 rounded-lg bg-white p-2 shadow-sm ${style.icon}`}>
                  <IconComponent size={16} />
                </div>

                <span className={`truncate text-sm font-bold ${style.text}`}>
                  {link?.title || 'Open Action'}
                </span>
              </div>

              <ChevronRight
                size={16}
                className={`${style.text} shrink-0 opacity-50 transition-all group-hover:translate-x-1 group-hover:opacity-100`}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SmartQuickLinks;