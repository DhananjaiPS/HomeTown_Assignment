import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useMySubmissions } from '../hooks/useSubmissions';
import {
  User,
  Mail,
  Sparkles,
  BookOpen,
  PenTool,
  CheckCircle,
  Edit2,
  X,
  Save,
  Clock,
  Trophy,
  Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { data: submissionData, isLoading: isLoadingSubmissions } = useMySubmissions();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.profile?.bio || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      bio: user?.profile?.bio || ''
    });
  };

  const getAccuracy = () => {
    if (!user?.stats?.assignmentsAttempted || !user?.stats?.totalMaxScore) return 0;
    return ((user.stats.totalScore / user.stats.totalMaxScore) * 100).toFixed(1);
  };

  return (
    <>
      {/* Header Section */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="absolute right-0 top-0 -z-10 h-64 w-64 -translate-y-1/2 translate-x-1/2 rounded-full bg-blue-100 opacity-60 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-purple-100 opacity-50 blur-3xl" />

        <div className="flex flex-col gap-8 md:flex-row md:items-center">
          {/* Avatar */}
          <div className="flex justify-center md:block">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 text-5xl font-extrabold text-white shadow-xl shadow-blue-100 sm:h-32 sm:w-32">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="w-full flex-1">
            {isEditing ? (
              <div className="mx-auto w-full max-w-xl space-y-5 md:mx-0">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-500">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter your name"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-500">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Tell us about your learning goals..."
                  />
                </div>

                {/* Equal Size Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gray-100 px-5 text-sm font-semibold text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative w-full">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="mb-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
                      {user?.name}
                    </h1>

                    <div className="mb-4 flex flex-wrap items-center gap-3 text-gray-500">
                      <span className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1 text-sm">
                        <Mail size={14} /> {user?.email}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1 text-sm capitalize">
                        <User size={14} /> {user?.role}
                      </span>
                    </div>

                    <p className="max-w-2xl leading-relaxed text-gray-700">
                      {user?.profile?.bio ||
                        'No bio added yet. Add a bio to tell others about your learning journey!'}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg active:scale-[0.98] sm:inline-flex"
                  >
                    <Edit2 size={16} />
                    Edit Profile
                  </button>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:from-blue-600 hover:to-blue-800 active:scale-[0.98] sm:hidden"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <h2 className="mb-6 px-2 text-2xl font-bold text-gray-900">
        Learning Statistics
      </h2>

      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Articles Read</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {user?.stats?.articlesCompleted || 0}
            </h3>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
            <PenTool size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Assignments Done</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {user?.stats?.assignmentsAttempted || 0}
            </h3>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
            <Flame size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Current Streak</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {user?.stats?.currentStreak || 0}{' '}
              <span className="text-sm font-normal text-gray-400">Days</span>
            </h3>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Avg Accuracy</p>
            <h3 className="mt-1 text-2xl font-bold text-gray-900">
              {getAccuracy()}%
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Activity Feed */}
        <div className="lg:col-span-2">
          <h2 className="mb-6 px-2 text-2xl font-bold text-gray-900">
            Recent Submissions
          </h2>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {isLoadingSubmissions ? (
              <div className="p-8 text-center text-gray-500">
                Loading your submissions...
              </div>
            ) : !submissionData?.submissions ||
              submissionData.submissions.length === 0 ? (
              <div className="flex flex-col items-center p-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-400">
                  <Clock size={28} />
                </div>
                <h3 className="mb-1 text-lg font-bold text-gray-900">
                  No submissions yet
                </h3>
                <p className="text-gray-500">
                  Read an article and complete your first assignment!
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {submissionData.submissions.map((sub) => (
                  <li
                    key={sub._id}
                    className="p-4 transition-colors hover:bg-gray-50 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {sub.assignmentId?.title || 'Unknown Assignment'}
                        </h4>
                        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(sub.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>Attempt #{sub.attemptNo}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-bold text-gray-900">
                            {sub.percentage.toFixed(1)}%
                          </div>
                          <div className="text-xs text-gray-500">
                            {sub.totalScore} / {sub.totalMaxScore} marks
                          </div>
                        </div>

                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold shadow-inner ${sub.percentage >= 80
                            ? 'bg-green-100 text-green-700'
                            : sub.percentage >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {sub.percentage >= 80
                            ? 'A'
                            : sub.percentage >= 50
                              ? 'B'
                              : 'C'}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Sidebar / Badges */}
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900 to-slate-900 p-6 text-white shadow-lg">
            <Sparkles
              className="absolute right-4 top-4 text-blue-400 opacity-20"
              size={80}
            />
            <h3 className="relative z-10 mb-1 text-lg font-bold">
              AI Power Usage
            </h3>
            <p className="relative z-10 mb-4 text-sm text-blue-200">
              Your AI tokens quota
            </p>

            <div className="relative z-10">
              <div className="mb-2 flex justify-between text-sm font-medium">
                <span>{user?.stats?.aiTokensUsed || 0}</span>
                <span className="text-blue-300">
                  {user?.stats?.aiTokensLimit || 10000} Max
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-700 bg-slate-800">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-cyan-300"
                  style={{
                    width: `${Math.min(
                      100,
                      ((user?.stats?.aiTokensUsed || 0) /
                        (user?.stats?.aiTokensLimit || 10000)) *
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-gray-900">
              <Trophy size={20} className="text-yellow-500" />
              Earned Badges
            </h3>

            {user?.badges && user.badges.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {user.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700"
                  >
                    <Trophy size={14} />
                    {badge.name}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm italic text-gray-500">
                No badges earned yet. Keep learning!
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;