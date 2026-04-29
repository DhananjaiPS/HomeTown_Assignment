import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useArticle, useArticleProgress, useAiSummary } from '../hooks/useArticles';
import {
  useAssignment,
  useSubmissions,
  useSubmitAssignment,
  useAiHint,
} from '../hooks/useSubmissions';
import toast from 'react-hot-toast';
import { BookOpen, Sparkles, CheckCircle, Clock, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ArticleDetail = () => {
  const { user, refreshUser } = useAuth();
  const { slug } = useParams();

  const { data: articleResponse, isLoading: isArticleLoading } = useArticle(slug);

  const article = articleResponse?.data || articleResponse;

  const {
    data: assignmentResponse,
    isError: noAssignment,
  } = useAssignment(article?._id);

  const assignmentData = assignmentResponse?.data || assignmentResponse;

  const { data: submissionsResponse } = useSubmissions(assignmentData?._id);

  const submissionsData = submissionsResponse?.data || submissionsResponse;

  const progressMutation = useArticleProgress();
  const summaryMutation = useAiSummary();
  const submitMutation = useSubmitAssignment();
  const hintMutation = useAiHint();

  const [summary, setSummary] = useState('');
  const [answers, setAnswers] = useState({});
  const [hints, setHints] = useState({});
  const [loadingHintQuestionId, setLoadingHintQuestionId] = useState(null);

  useEffect(() => {
    if (!article?._id) return;

    const timer = setTimeout(() => {
      progressMutation.mutate({
        id: article._id,
        progressPercentage: 100,
        completed: true,
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [article?._id]);

  const isInvalidAiText = (text) => {
    if (!text) return true;
    const lowerText = text.toLowerCase();

    // If it's our graceful 503/429 fallback, it is NOT "invalid". 
    // We want to show this to the user!
    if (text.includes('⏳') || text.includes('⚠️')) {
      return false;
    }

    // Only block hard, unhandled backend crashes
    return (
      lowerText === 'failed to generate summary' ||
      lowerText.includes('ai service unavailable') ||
      lowerText.includes('something went wrong')
    );
  };

  const handleGenerateSummary = async () => {
    if (!article?._id) {
      toast.error('Article not loaded yet');
      return;
    }

    try {
      const res = await summaryMutation.mutateAsync(article._id);

      const summaryText = res?.data?.summary || res?.summary || res?.data?.data?.summary || '';
      const cached = res?.data?.cached ?? res?.cached ?? false;

      if (isInvalidAiText(summaryText)) {
        setSummary('');
        toast.error('AI summary failed. Please try again later.');
        return;
      }

      // --- THE PRO HANDLING UI ---
      setSummary(summaryText); // Always put the text in the blue box

      if (summaryText.includes('⏳')) {
        toast.error('AI servers are busy, but we caught it!');
      } else if (summaryText.includes('⚠️')) {
        toast.error('AI Configuration Error');
      } else {
        // Standard Success
        toast.success(cached ? 'AI Summary loaded from cache!' : 'AI Summary generated!');
        
        // UPDATE TOKEN COUNT INSTANTLY
        if (res?.data?.stats && user) {
          setUser({ ...user, stats: res.data.stats });
        } else if (!cached) {
          refreshUser();
        }
      }

    } catch (error) {
      setSummary('');
      toast.error(error?.response?.data?.message || error?.message || 'Failed to generate summary');
    }
  };

  const handleGetHint = async (questionId, questionText) => {
    if (!assignmentData?._id) {
      toast.error('Assignment not loaded');
      return;
    }

    try {
      setLoadingHintQuestionId(questionId);

      const res = await hintMutation.mutateAsync({
        assignmentId: assignmentData._id,
        questionId,
        questionText
      });

      const hintText =
        res?.data?.hint ||
        res?.hint ||
        res?.data?.data?.hint ||
        res;

      const cached = res?.data?.cached ?? res?.cached ?? false;

      if (!hintText || typeof hintText !== 'string') {
        toast.error('Failed to get hint');
        return;
      }

      setHints((prev) => ({ ...prev, [questionId]: hintText }));
      toast.success(cached ? 'Hint loaded from cache!' : 'Hint generated!');
      
      // UPDATE TOKEN COUNT INSTANTLY
      if (res?.data?.stats && user) {
        setUser({ ...user, stats: res.data.stats });
      } else if (!cached) {
        refreshUser();
      }

    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to get hint'
      );
    } finally {
      setLoadingHintQuestionId(null);
    }
  };

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers((prev) => {
      const existing = prev[questionId] || { questionId };
      if (type === 'msq') {
        const currentSelections = existing.selectedOptions || [];
        const newSelections = currentSelections.includes(value)
          ? currentSelections.filter(v => v !== value)
          : [...currentSelections, value];
        return { ...prev, [questionId]: { ...existing, selectedOptions: newSelections } };
      } else if (type === 'mcq' || type === 'true_false') {
        return { ...prev, [questionId]: { ...existing, selectedOption: value } };
      } else {
        return { ...prev, [questionId]: { ...existing, userAnswer: value } };
      }
    });
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();

    const formattedAnswers = Object.values(answers);

    if (!assignmentData?.questions?.length) {
      toast.error('Assignment not loaded');
      return;
    }

    if (formattedAnswers.length !== assignmentData.questions.length) {
      toast.error('Please answer all questions before submitting.');
      return;
    }

    try {
      const res = await submitMutation.mutateAsync({
        articleId: article._id,
        assignmentId: assignmentData._id,
        answers: formattedAnswers,
        timeTakenSeconds: 120,
      });

      // UPDATE TOKEN COUNT INSTANTLY (AI evaluation uses tokens)
      if (res?.data?.stats && user) {
        setUser({ ...user, stats: res.data.stats });
      } else {
        refreshUser();
      }

      toast.success('Assignment evaluated successfully!');
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Submission failed'
      );
    }
  };

  if (isArticleLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="loader"></div>
      </div>
    );
  }

  if (!article) {
    return <div className="text-center py-12">Article not found.</div>;
  }

  const submissions = submissionsData?.submissions || [];
  const bestSubmission = submissions[0];
  const attemptsCount = submissionsData?.total || submissions.length || 0;
  const canAttempt =
    !assignmentData?.maxAttempts || attemptsCount < assignmentData.maxAttempts;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-card p-8 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-4">
          <BookOpen size={18} />
          <span>Article</span>
        </div>

        <h1 className="text-4xl font-extrabold text-foreground mb-4 leading-tight">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-8 border-b border-border pb-6">
          <span className="flex items-center gap-1">
            <Clock size={16} /> {article.readingTimeMinutes || 1} min read
          </span>
          <span className="capitalize bg-gray-100 px-2 py-1 rounded text-gray-700">
            {article.difficulty || 'beginner'}
          </span>
          <span>By {article.createdBy?.name || 'Admin'}</span>
          <span>
            {article.createdAt
              ? new Date(article.createdAt).toLocaleDateString()
              : ''}
          </span>
        </div>

        <div className="prose prose-blue max-w-none mb-10 text-foreground leading-relaxed whitespace-pre-wrap">
          {article.content}
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <Sparkles className="text-blue-500" size={20} />
              AI Magic Summary
            </h3>

            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={summaryMutation.isPending}
              className="bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {summaryMutation.isPending ? (
                <div className="loader w-4 h-4 border-blue-600 border-t-transparent"></div>
              ) : (
                'Summarize'
              )}
            </button>
          </div>

          {summary ? (
            <div className="text-blue-800 text-sm whitespace-pre-wrap leading-relaxed">
              {summary}
            </div>
          ) : (
            <p className="text-blue-600/70 text-sm">
              Too long to read? Let AI summarize it for you.
            </p>
          )}
        </div>
      </div>

      {assignmentData && !noAssignment && (
        <div className="bg-card p-8 rounded-2xl shadow-sm border border-border mt-12">
          <div className="border-b border-border pb-4 mb-6">
            <h2 className="text-2xl font-bold">
              Assignment: {assignmentData.title}
            </h2>

            <p className="text-gray-500 mt-2">
              {assignmentData.instructions}
            </p>

            <div className="flex gap-4 mt-4 text-sm">
              <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                Total Marks: {assignmentData.totalMarks}
              </span>

              <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                Attempts: {attemptsCount} / {assignmentData.maxAttempts || '∞'}
              </span>
            </div>
          </div>

          {bestSubmission && !submitMutation.isPending && (
            <div
              className={`p-4 rounded-lg mb-8 border ${bestSubmission.percentage >= 80
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
                }`}
            >
              <h3 className="font-bold flex items-center gap-2">
                <CheckCircle
                  className={
                    bestSubmission.percentage >= 80
                      ? 'text-green-600'
                      : 'text-yellow-600'
                  }
                  size={20}
                />
                Last Attempt Score: {(bestSubmission.percentage || 0).toFixed(1)}%
              </h3>

              <p className="text-sm mt-1 text-gray-700">
                You scored {bestSubmission.totalScore} out of{' '}
                {bestSubmission.totalMaxScore}.
              </p>

              {bestSubmission.answers?.map(
                (ans, idx) =>
                  ans.type === 'short_answer' &&
                  ans.aiEvaluation && (
                    <div
                      key={idx}
                      className="mt-4 bg-white/60 p-3 rounded text-sm border border-black/5"
                    >
                      <strong>AI Feedback (Q{idx + 1}):</strong>{' '}
                      {ans.aiEvaluation.feedback}
                      <br />
                      <strong className="text-blue-700">Improvement:</strong>{' '}
                      {ans.aiEvaluation.improvement}
                    </div>
                  )
              )}
            </div>
          )}

          {!canAttempt && (
            <div className="text-center p-6 bg-red-50 text-red-600 rounded-lg font-medium border border-red-100">
              You have reached the maximum number of attempts for this assignment.
            </div>
          )}

          {canAttempt && (
            <form onSubmit={handleSubmitAssignment} className="space-y-8">
              {assignmentData.questions?.map((q, index) => (
                <div
                  key={q._id}
                  className="bg-gray-50 p-6 rounded-xl border border-border"
                >
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h3 className="font-semibold text-lg">
                      <span className="text-primary mr-2">Q{index + 1}.</span>
                      {q.questionText}
                    </h3>

                    <span className="text-xs font-bold bg-white border px-2 py-1 rounded text-gray-500">
                      {q.marks} Marks
                    </span>
                  </div>

                  {['mcq', 'msq', 'true_false'].includes(q.type) ? (
                    <div className="space-y-3 mt-4">
                      {q.options?.map((opt, optIndex) => (
                        <label
                          key={opt._id || opt.label || optIndex}
                          className="flex items-center p-3 border rounded-lg bg-white cursor-pointer hover:border-primary transition-colors has-[:checked]:border-primary has-[:checked]:bg-blue-50"
                        >
                          <input
                            type={q.type === 'msq' ? 'checkbox' : 'radio'}
                            name={q.type === 'msq' ? `question-${q._id}-${opt.label}` : `question-${q._id}`}
                            value={opt.label}
                            onChange={(e) =>
                              handleAnswerChange(
                                q._id,
                                e.target.value,
                                q.type
                              )
                            }
                            className="mr-3 text-primary focus:ring-primary h-4 w-4"
                            required={q.type !== 'msq'}
                          />

                          <span className="font-medium mr-2">
                            {opt.label}.
                          </span>

                          {opt.text}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4">
                      <textarea
                        className="w-full p-4 border border-border rounded-lg focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-y"
                        placeholder="Type your answer here..."
                        onChange={(e) =>
                          handleAnswerChange(
                            q._id,
                            e.target.value,
                            'short_answer'
                          )
                        }
                        required
                      ></textarea>
                    </div>
                  )}

                  <div className="mt-4 flex flex-col items-start gap-2">
                    <button
                      type="button"
                      onClick={() => handleGetHint(q._id, q.questionText)}
                      // Keep the lock so they can't spam multiple API calls at once
                      disabled={loadingHintQuestionId !== null}
                      className={`text-sm flex items-center gap-1 font-medium transition-all ${loadingHintQuestionId === q._id
                        ? 'text-blue-600 opacity-50 cursor-wait' // Only the active button fades out
                        : loadingHintQuestionId !== null
                          ? 'text-gray-400 cursor-not-allowed'     // Other buttons look inactive but NOT fetching
                          : 'text-blue-600 hover:text-blue-800'    // Default state
                        }`}
                    >
                      <Sparkles size={14} />
                      {loadingHintQuestionId === q._id ? 'Generating hint...' : 'Get AI Hint'}
                    </button>

                    {hints[q._id] && (
                      <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-800 w-full flex items-start gap-2">
                        <Info size={16} className="mt-0.5 shrink-0" />
                        <span>{hints[q._id]}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-4 border-t border-border">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="bg-primary hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
                >
                  {submitMutation.isPending ? (
                    <>
                      Evaluating AI...
                      <div className="loader w-4 h-4 border-2 border-t-white"></div>
                    </>
                  ) : (
                    'Submit Assignment'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleDetail;