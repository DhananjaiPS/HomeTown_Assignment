import React from 'react';
import { useAdaptiveInsights } from '../../hooks/useAdaptiveAI';
import { BrainCircuit, TrendingUp, AlertTriangle } from 'lucide-react';

const PredictiveInsights = () => {
  const { data: insights, isLoading } = useAdaptiveInsights();

  if (isLoading) {
    return <div className="animate-pulse bg-card p-6 rounded-xl border border-border h-48"></div>;
  }

  if (!insights) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-6 rounded-xl border border-indigo-800 shadow-lg text-white relative overflow-hidden h-full">
      <BrainCircuit className="absolute -bottom-4 -right-4 text-indigo-500/20" size={120} />
      
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 relative z-10">
        <TrendingUp size={20} className="text-indigo-400" />
        AI Predictive Insights
      </h3>

      <div className="space-y-4 relative z-10">
        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
          <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-1">Shadow Benchmark</p>
          <p className="text-sm">You perform better than <strong className="text-white text-lg">{insights.percentile}%</strong> of similar learners.</p>
        </div>

        <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/10">
          <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider mb-1">Pacing Predictor</p>
          <p className="text-sm">At your current pace, you'll complete the curriculum in <strong className="text-white text-lg">{insights.estimatedCompletionDays} days</strong>.</p>
        </div>

        {insights.nudge && (
          <div className="bg-orange-500/20 rounded-lg p-3 backdrop-blur-sm border border-orange-500/30 flex items-start gap-2">
            <AlertTriangle size={18} className="text-orange-400 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-100">{insights.nudge}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictiveInsights;
