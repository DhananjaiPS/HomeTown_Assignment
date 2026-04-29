import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { PenTool, CheckCircle, Clock, AlertCircle, Send, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AuthorRequestWidget = () => {
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchRequestStatus = async () => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get('/author-requests/my');

      // Handles both backend response shapes:
      // 1. { data: request }
      // 2. request
      const normalizedRequest = data?.data || data || null;

      console.log('MY REQUEST STATUS DATA:', normalizedRequest);

      setRequest(normalizedRequest);
    } catch (err) {
      console.error('FETCH STATUS ERROR:', err);
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'learner') {
      fetchRequestStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanMessage = message.trim();

    if (cleanMessage.length < 10) {
      toast.error('Please write at least 10 characters in your message.');
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await axiosInstance.post('/author-requests', {
        message: cleanMessage
      });

      const createdRequest = data?.data || data || null;

      toast.success('Request submitted! Awaiting admin review.');

      setRequest(createdRequest);
      setShowModal(false);
      setMessage('');

      await fetchRequestStatus();

      // Safety re-sync for slower DB/UI state
      setTimeout(fetchRequestStatus, 800);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to submit request';

      toast.error(errorMsg);

      // If duplicate/pending already exists, re-fetch and show correct pending state
      await fetchRequestStatus();
    } finally {
      setSubmitting(false);
    }
  };

  // Hide widget completely for author/admin
  if (!user || user.role === 'author' || user.role === 'admin') return null;

  if (loading) {
    return (
      <div className="h-32 animate-pulse rounded-2xl border border-blue-100 bg-blue-50" />
    );
  }

  const status = request?.status;
  const canApply = !request || status === 'rejected';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm">
      <div className="absolute right-0 top-0 p-4 opacity-10 transition-opacity">
        <PenTool size={80} className="rotate-12 text-blue-500" />
      </div>

      <div className="relative z-10">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-black text-gray-900">
              <PenTool size={20} className="text-blue-600" />
              Become an Author
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Share your knowledge by creating articles and assignments.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRequestStatus}
            className="h-9 rounded-xl border border-blue-100 bg-white px-3 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
          >
            Refresh Status
          </button>
        </div>

        {canApply ? (
          <>
            {status === 'rejected' && (
              <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                <strong>Not Approved:</strong>{' '}
                {request?.adminNote ||
                  'Your previous request was not approved. You may reapply.'}
              </div>
            )}

            <p className="mb-4 max-w-md text-sm text-gray-600">
              Apply to become an author and create learning content for other
              students.
            </p>

            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 text-sm font-bold text-white shadow-md shadow-blue-100 transition-all hover:from-blue-600 hover:to-blue-700 active:scale-[0.98]"
            >
              {status === 'rejected' ? 'Reapply Now' : 'Apply Now'}
            </button>
          </>
        ) : status === 'pending' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 p-4 text-amber-700">
              <Clock size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Application Under Review</p>
                <p className="mt-0.5 text-xs opacity-80">
                  Your request has already been submitted. Admin approval is
                  pending.
                </p>
                {request?.message && (
                  <p className="mt-2 text-xs">
                    <span className="font-semibold">Your message:</span>{' '}
                    {request.message}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled
              className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-xl border border-gray-200 bg-gray-100 text-sm font-bold text-gray-400"
            >
              ✓ Applied — Awaiting Review
            </button>
          </div>
        ) : status === 'approved' ? (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-green-700">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold">
                  Congratulations! You are now an Author.
                </p>
                <p className="mt-0.5 text-xs opacity-80">
                  {request?.adminNote ||
                    'You can now create articles and assignments.'}
                </p>
              </div>
            </div>

            <a
              href="/admin"
              className="block h-11 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-5 py-3 text-center text-sm font-bold text-white shadow-md shadow-blue-100 transition hover:from-blue-600 hover:to-blue-700"
            >
              Go to Author Studio →
            </a>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
            Unable to detect request status. Please refresh.
          </div>
        )}
      </div>

      {/* Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-black text-gray-900">
                  Author Application
                </h3>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="mb-2 block text-sm font-bold text-gray-700">
                    Why do you want to become an author?
                  </label>

                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us your expertise and what topics you want to cover..."
                    className="h-32 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    minLength={10}
                    required
                  />

                  <p className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <AlertCircle size={12} />
                      Admins will review your activity.
                    </span>
                    <span
                      className={
                        message.trim().length < 10
                          ? 'text-red-400'
                          : 'text-green-500'
                      }
                    >
                      {message.trim().length}/10 min
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="h-12 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting || message.trim().length < 10}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-sm font-bold text-white transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Send Request'}
                    {!submitting && <Send size={18} />}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthorRequestWidget;