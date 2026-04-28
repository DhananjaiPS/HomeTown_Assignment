import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash, FileQuestion, X } from 'lucide-react';

const AdminAssignments = () => {
  const queryClient = useQueryClient();

  const initialFormData = {
    articleId: '',
    title: '',
    instructions: '',
    totalMarks: 10,
    maxAttempts: 3,
  };

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [questions, setQuestions] = useState([]);

  const { data: articlesData, isLoading: isArticlesLoading } = useQuery({
    queryKey: ['admin-articles-list'],
    queryFn: async () => {
      const res = await axiosInstance.get('/articles?limit=50');
      return res.data;
    },
  });

  const articles = articlesData?.data?.articles || articlesData?.articles || [];

  const createMutation = useMutation({
    mutationFn: async (newAssignment) => {
      const res = await axiosInstance.post('/assignments', newAssignment);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Assignment created successfully');
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsCreating(false);
      setFormData(initialFormData);
      setQuestions([]);
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create assignment'
      );
    },
  });

  const addQuestion = (type) => {
    let newQuestion = { type, questionText: '', marks: 5 };

    if (type === 'true_false') {
      newQuestion.options = [
        { label: 'A', text: 'True', isCorrect: true },
        { label: 'B', text: 'False', isCorrect: false },
      ];
    } else if (type === 'mcq') {
      newQuestion.options = [
        { label: 'A', text: '', isCorrect: true },
        { label: 'B', text: '', isCorrect: false },
      ];
    } else if (type === 'msq') {
      newQuestion.options = [
        { label: 'A', text: '', isCorrect: false },
        { label: 'B', text: '', isCorrect: false },
        { label: 'C', text: '', isCorrect: false },
        { label: 'D', text: '', isCorrect: false },
      ];
    } else if (type === 'short_answer') {
      newQuestion = {
        type: 'short_answer',
        questionText: '',
        marks: 10,
        expectedAnswer: '',
        rubric: '',
      };
    }

    setQuestions((prev) => [...prev, newQuestion]);
  };

  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateQuestionField = (index, field, value) => {
    setQuestions((prev) =>
      prev.map((question, idx) =>
        idx === index ? { ...question, [field]: value } : question
      )
    );
  };

  const addOption = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== questionIndex) return q;
        const newLabel = String.fromCharCode(65 + q.options.length);
        return {
          ...q,
          options: [...q.options, { label: newLabel, text: '', isCorrect: false }],
        };
      })
    );
  };

  const removeOption = (questionIndex, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== questionIndex) return q;
        const newOptions = q.options
          .filter((_, oIdx) => oIdx !== optionIndex)
          .map((opt, i) => ({
            ...opt,
            label: String.fromCharCode(65 + i), // Re-assign letters (A, B, C...)
          }));
        return { ...q, options: newOptions };
      })
    );
  };

  const updateOptionText = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((question, qIdx) => {
        if (qIdx !== questionIndex) return question;
        return {
          ...question,
          options: question.options.map((option, oIdx) =>
            oIdx === optionIndex ? { ...option, text: value } : option
          ),
        };
      })
    );
  };

  const toggleCorrectOption = (questionIndex, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, qIdx) => {
        if (qIdx !== questionIndex) return q;

        if (q.type === 'msq') {
          // MSQ: Toggle individual checkboxes
          return {
            ...q,
            options: q.options.map((opt, oIdx) =>
              oIdx === optionIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt
            ),
          };
        } else {
          // MCQ & True/False: Exclusive selection (Radio button logic)
          return {
            ...q,
            options: q.options.map((opt, oIdx) => ({
              ...opt,
              isCorrect: oIdx === optionIndex,
            })),
          };
        }
      })
    );
  };

  const validateForm = () => {
    if (!formData.articleId) {
      toast.error('Select an article');
      return false;
    }
    if (!formData.title.trim()) {
      toast.error('Assignment title is required');
      return false;
    }
    if (!formData.instructions.trim()) {
      toast.error('Instructions are required');
      return false;
    }
    if (questions.length === 0) {
      toast.error('Add at least one question');
      return false;
    }

    for (let i = 0; i < questions.length; i += 1) {
      const q = questions[i];

      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return false;
      }
      if (!Number(q.marks) || Number(q.marks) <= 0) {
        toast.error(`Question ${i + 1} must have valid marks`);
        return false;
      }

      if (['mcq', 'msq', 'true_false'].includes(q.type)) {
        if (q.type === 'mcq' && q.options.length < 2) {
          toast.error(`Question ${i + 1} (MCQ) must have at least 2 options`);
          return false;
        }
        if (q.type === 'msq' && q.options.length < 4) {
          toast.error(`Question ${i + 1} (MSQ) must have at least 4 options`);
          return false;
        }

        if (q.options.some((option) => !option.text.trim())) {
          toast.error(`All option texts are required for question ${i + 1}`);
          return false;
        }

        const correctCount = q.options.filter((opt) => opt.isCorrect).length;
        if (q.type === 'msq' && correctCount < 1) {
          toast.error(`Select at least one correct option for MSQ question ${i + 1}`);
          return false;
        }
        if (q.type !== 'msq' && correctCount !== 1) {
          toast.error(`Select exactly one correct option for question ${i + 1}`);
          return false;
        }
      }

      if (q.type === 'short_answer' && !q.expectedAnswer.trim()) {
        toast.error(`Expected answer is required for question ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const totalMarks = questions.reduce(
      (sum, question) => sum + Number(question.marks || 0),
      0
    );

    createMutation.mutate({
      ...formData,
      totalMarks,
      maxAttempts: Number(formData.maxAttempts),
      questions: questions.map((question) => ({
        ...question,
        marks: Number(question.marks),
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileQuestion size={20} />
          Manage Assignments
        </h2>

        <button
          type="button"
          onClick={() => setIsCreating((prev) => !prev)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-blue-700"
        >
          <Plus size={16} />
          {isCreating ? 'Cancel' : 'New Assignment'}
        </button>
      </div>

      {isCreating ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Target Article
              </label>
              <select
                required
                className="w-full border p-2 rounded"
                value={formData.articleId}
                disabled={isArticlesLoading}
                onChange={(e) =>
                  setFormData({ ...formData, articleId: e.target.value })
                }
              >
                <option value="">
                  {isArticlesLoading ? 'Loading articles...' : 'Select an Article'}
                </option>
                {articles.map((article) => (
                  <option key={article._id} value={article._id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                required
                type="text"
                className="w-full border p-2 rounded"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Assignment title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Max Attempts
              </label>
              <input
                required
                min="1"
                type="number"
                className="w-full border p-2 rounded"
                value={formData.maxAttempts}
                onChange={(e) =>
                  setFormData({ ...formData, maxAttempts: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Total Marks
              </label>
              <input
                disabled
                type="number"
                className="w-full border p-2 rounded bg-gray-100"
                value={questions.reduce(
                  (sum, question) => sum + Number(question.marks || 0),
                  0
                )}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Instructions
            </label>
            <textarea
              required
              className="w-full border p-2 rounded min-h-[90px]"
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              placeholder="Write instructions for learners"
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center gap-4 mb-3">
              <h3 className="font-bold">Questions</h3>
              <p className="text-xs text-gray-500">
                Total: {questions.length} question(s)
              </p>
            </div>

            {questions.length === 0 && (
              <div className="border border-dashed rounded p-6 text-center text-gray-500 mb-4">
                Select a question type below to get started.
              </div>
            )}

            {questions.map((q, i) => (
              <div
                key={i}
                className="bg-gray-50 p-4 border rounded mb-4 relative space-y-3"
              >
                <button
                  type="button"
                  onClick={() => removeQuestion(i)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  title="Remove question"
                >
                  <Trash size={16} />
                </button>

                <div className="pr-8">
                  <label className="text-xs font-bold uppercase text-gray-500">
                    {q.type.replace('_', ' ')} Question {i + 1}
                  </label>

                  <input
                    required
                    placeholder="Question text"
                    className="w-full border p-2 rounded mt-1"
                    value={q.questionText}
                    onChange={(e) =>
                      updateQuestionField(i, 'questionText', e.target.value)
                    }
                  />
                </div>

                <div className="w-full md:w-40">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Marks
                  </label>
                  <input
                    required
                    min="1"
                    type="number"
                    className="w-full border p-2 rounded"
                    value={q.marks}
                    onChange={(e) =>
                      updateQuestionField(i, 'marks', e.target.value)
                    }
                  />
                </div>

                {['mcq', 'msq', 'true_false'].includes(q.type) && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs font-semibold">
                      Options {q.type === 'msq' ? '(Select all correct)' : '(Select one correct)'}
                    </p>

                    {q.options.map((opt, oIdx) => (
                      <div key={opt.label} className="flex items-center gap-2">
                        <input
                          type={q.type === 'msq' ? 'checkbox' : 'radio'}
                          name={`correct-${i}-${q.type === 'msq' ? oIdx : ''}`}
                          checked={opt.isCorrect}
                          onChange={() => toggleCorrectOption(i, oIdx)}
                          className="w-4 h-4 cursor-pointer"
                        />

                        <span className="font-medium text-sm w-5">
                          {opt.label}.
                        </span>

                        <input
                          required
                          placeholder={`Option ${opt.label}`}
                          className="flex-1 border p-2 rounded text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                          value={opt.text}
                          onChange={(e) => updateOptionText(i, oIdx, e.target.value)}
                          disabled={q.type === 'true_false'}
                        />

                        {q.type !== 'true_false' && q.options.length > (q.type === 'msq' ? 4 : 2) && (
                          <button
                            type="button"
                            onClick={() => removeOption(i, oIdx)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}

                    {q.type !== 'true_false' && (
                      <button
                        type="button"
                        onClick={() => addOption(i)}
                        className="text-xs text-blue-600 font-medium flex items-center gap-1 mt-2 hover:underline"
                      >
                        <Plus size={12} /> Add Option
                      </button>
                    )}
                  </div>
                )}

                {q.type === 'short_answer' && (
                  <div className="space-y-2 mt-2">
                    <textarea
                      required
                      placeholder="Expected Answer. AI will use this to grade."
                      className="w-full border p-2 rounded text-sm min-h-[90px]"
                      value={q.expectedAnswer}
                      onChange={(e) =>
                        updateQuestionField(i, 'expectedAnswer', e.target.value)
                      }
                    />

                    <input
                      placeholder="Grading Rubric, optional but recommended"
                      className="w-full border p-2 rounded text-sm"
                      value={q.rubric}
                      onChange={(e) =>
                        updateQuestionField(i, 'rubric', e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => addQuestion('true_false')}
                className="border px-3 py-2 text-sm font-medium rounded bg-white hover:bg-gray-50"
              >
                + True / False
              </button>
              <button
                type="button"
                onClick={() => addQuestion('mcq')}
                className="border px-3 py-2 text-sm font-medium rounded bg-white hover:bg-gray-50"
              >
                + MCQ (Single Answer)
              </button>
              <button
                type="button"
                onClick={() => addQuestion('msq')}
                className="border px-3 py-2 text-sm font-medium rounded bg-white hover:bg-gray-50"
              >
                + MSQ (Multiple Answers)
              </button>
              <button
                type="button"
                onClick={() => addQuestion('short_answer')}
                className="border px-3 py-2 text-sm font-medium rounded bg-white hover:bg-gray-50 border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                + AI Short Answer
              </button>
            </div>
          </div>

          <button
            disabled={createMutation.isPending}
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium mt-4 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Saving...' : 'Save Assignment'}
          </button>
        </form>
      ) : (
        <div className="bg-white p-12 text-center border border-gray-200 rounded text-gray-500 shadow-sm">
          <p>
            Click "New Assignment" to create a new assignment and attach it to
            an article.
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;