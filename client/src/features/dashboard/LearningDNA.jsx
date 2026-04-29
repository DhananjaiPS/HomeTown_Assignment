import React from 'react';
import { useLearningDNA } from '../../hooks/useAdaptiveAI';
import { Dna, Briefcase, Zap, AlertCircle } from 'lucide-react';

const LearningDNA = () => {
  const { data, isLoading } = useLearningDNA();

  if (isLoading) {
    return (
      <div className="animate-pulse bg-white p-6 rounded-xl border border-gray-200 h-64" />
    );
  }

  if (!data) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 text-center">
        <AlertCircle className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">No learning data available yet.</p>
      </div>
    );
  }

  // SAFE FALLBACKS
  const readiness = data?.readiness || {
    dsa: 0,
    systemDesign: 0,
    coreSubjects: 0
  };

  const dna = data?.dna || {
    strengths: [],
    weaknesses: []
  };

  const safePercent = (val) => Number(val || 0);

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-full flex flex-col">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900">
        <Dna size={20} className="text-blue-600" />
        Learning DNA Profile
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

        {/* Career Readiness */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase size={14} /> Career Readiness
          </h4>

          {['dsa', 'systemDesign', 'coreSubjects'].map((key, idx) => {
            const value = safePercent(readiness[key]);

            const colors = [
              'bg-blue-500',
              'bg-purple-500',
              'bg-green-500'
            ];

            const labels = {
              dsa: 'DSA',
              systemDesign: 'System Design',
              coreSubjects: 'Core Subjects'
            };

            return (
              <div key={key}>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>{labels[key]}</span>
                  <span className="text-gray-500">{value.toFixed(0)}%</span>
                </div>

                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div
                    className={`${colors[idx]} h-1.5 rounded-full transition-all duration-500`}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cognitive Traits */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={14} /> Cognitive Traits
          </h4>

          {/* Strengths */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Key Strengths
            </p>

            <div className="flex flex-wrap gap-2">
              {dna.strengths?.length > 0 ? (
                dna.strengths.map((str, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md font-medium"
                  >
                    {str}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">
                  No strengths detected yet
                </span>
              )}
            </div>
          </div>

          {/* Weaknesses */}
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-2">
              Areas to Improve
            </p>

            <div className="flex flex-wrap gap-2">
              {dna.weaknesses?.length > 0 ? (
                dna.weaknesses.map((wk, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md font-medium"
                  >
                    {wk}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-400">
                  No weaknesses detected yet
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LearningDNA;