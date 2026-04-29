import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axios';
import { toast } from 'react-hot-toast';
import {
  User,
  Mail,
  MessageSquare,
  Check,
  X,
  Award,
  Target,
  Clock,
  Shield,
  RefreshCw
} from 'lucide-react';

const AdminAuthorRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const normalizeRequests = (data) => {
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.requests)) return data.requests;
    return [];
  };

  const fetchRequests = async () => {
    setLoading(true);

    try {
      const { data } = await axiosInstance.get('/author-requests/all');

      console.log('AUTHOR REQUESTS DATA RECEIVED:', data);

      const normalized = normalizeRequests(data);
      setRequests(normalized);
    } catch (err) {
      console.error('FETCH REQUESTS ERROR:', err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to fetch author requests'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    setProcessing(true);

    try {
      await axiosInstance.patch(`/author-requests/${id}`, {
        status,
        adminNote: adminNote.trim()
      });

      toast.success(`Request ${status} successfully`);

      setActiveRequest(null);
      setAdminNote('');
      await fetchRequests();
    } catch (err) {
      console.error('UPDATE REQUEST ERROR:', err);
      toast.error(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to update request'
      );
    } finally {
      setProcessing(false);
    }
  };

  const pendingCount = requests.filter(
    (req) => req?.status?.toLowerCase() === 'pending'
  ).length;

  if (loading) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="font-semibold text-gray-600">Loading author requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-black text-gray-900">
            <Shield className="text-blue-600" size={26} />
            Author Applications
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Review and manage user requests to become authors.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={fetchRequests}
            className="flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-white px-4 text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <div className="flex h-11 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-bold text-blue-700">
            {pendingCount} Pending Request{pendingCount !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Empty State */}
      {requests.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-blue-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <User size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
          <p className="mt-1 text-gray-500">
            When users apply to become authors, they will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {requests.map((req) => {
            const status = req?.status?.toLowerCase() || 'pending';
            const user = req?.user;

            const avgScore =
              user?.stats?.totalMaxScore > 0
                ? (
                  (user.stats.totalScore / user.stats.totalMaxScore) *
                  100
                ).toFixed(0)
                : 0;

            return (
              <div
                key={req._id}
                className={`rounded-3xl border bg-white shadow-sm transition-all ${status === 'pending'
                  ? 'border-blue-200 ring-2 ring-blue-50'
                  : 'border-gray-200'
                  }`}
              >
                <div className="p-6">
                  {/* User Header */}
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-sky-400 text-lg font-black text-white shadow-md">
                        {user?.name ? user.name[0].toUpperCase() : '?'}
                      </div>

                      <div>
                        <h4 className="font-black text-gray-900">
                          {user?.name || 'Unknown User'}
                        </h4>
                        <p className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail size={12} />
                          {user?.email || 'No email'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black uppercase ${status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-blue-50 p-3 text-center">
                      <Target size={16} className="mx-auto mb-1 text-blue-600" />
                      <p className="text-[10px] font-black uppercase text-blue-700">
                        Avg. Score
                      </p>
                      <p className="text-sm font-black text-blue-900">
                        {avgScore}%
                      </p>
                    </div>

                    <div className="rounded-xl bg-sky-50 p-3 text-center">
                      <Clock size={16} className="mx-auto mb-1 text-sky-600" />
                      <p className="text-[10px] font-black uppercase text-sky-700">
                        Streak
                      </p>
                      <p className="text-sm font-black text-sky-900">
                        {user?.stats?.currentStreak || 0}d
                      </p>
                    </div>

                    <div className="rounded-xl bg-indigo-50 p-3 text-center">
                      <Award
                        size={16}
                        className="mx-auto mb-1 text-indigo-600"
                      />
                      <p className="text-[10px] font-black uppercase text-indigo-700">
                        Badges
                      </p>
                      <p className="text-sm font-black text-indigo-900">
                        {user?.badges?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6 rounded-xl bg-gray-50 p-4">
                    <p className="mb-2 flex items-center gap-1 text-xs font-black uppercase text-gray-400">
                      <MessageSquare size={12} />
                      Applicant Message
                    </p>
                    <p className="text-sm italic text-gray-700">
                      "{req.message}"
                    </p>
                    <p className="mt-3 text-xs text-gray-400">
                      Applied on{' '}
                      {req.createdAt
                        ? new Date(req.createdAt).toLocaleString()
                        : 'Unknown date'}
                    </p>
                  </div>

                  {/* Actions */}
                  {status === 'pending' ? (
                    activeRequest === req._id ? (
                      <div className="space-y-4">
                        <textarea
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Add a note for the user (optional)..."
                          className="h-24 w-full resize-none rounded-xl border border-blue-100 bg-white p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          <button
                            type="button"
                            onClick={() => handleAction(req._id, 'approved')}
                            disabled={processing}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-green-600 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Approve
                            <Check size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAction(req._id, 'rejected')}
                            disabled={processing}
                            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Reject
                            <X size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveRequest(null);
                              setAdminNote('');
                            }}
                            disabled={processing}
                            className="flex h-11 items-center justify-center rounded-xl bg-gray-100 text-sm font-bold text-gray-600 transition hover:bg-gray-200 disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveRequest(req._id);
                          setAdminNote('');
                        }}
                        className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-black text-white shadow-md shadow-blue-100 transition hover:from-blue-600 hover:to-blue-700 active:scale-[0.98]"
                      >
                        Review Application
                      </button>
                    )
                  ) : (
                    <div className="border-t border-gray-100 pt-4 text-xs text-gray-500">
                      <p>
                        <strong>Admin Note:</strong>{' '}
                        {req.adminNote || 'No note provided.'}
                      </p>
                      <p className="mt-1">
                        Reviewed on{' '}
                        {req.reviewedAt
                          ? new Date(req.reviewedAt).toLocaleDateString()
                          : 'Not available'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminAuthorRequests;