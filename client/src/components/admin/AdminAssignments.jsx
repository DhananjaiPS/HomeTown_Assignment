import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash, FileQuestion, X, Edit, Archive } from 'lucide-react';

const AdminAssignments = () => {
  const queryClient = useQueryClient();

  const initialFormData = {
    articleId: '',
    title: '',
    instructions: '',
    totalMarks: 10,
    maxAttempts: 3,
    status: 'active'
  };

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [questions, setQuestions] = useState([]);

  // Fetch articles for the dropdown
  const { data: articlesData, isLoading: isArticlesLoading } = useQuery({
    queryKey: ['admin-articles-list'],
    queryFn: async () => {
      const res = await axiosInstance.get('/articles?limit=50');
      return res.data;
    },
  });

  const articles = articlesData?.data?.articles || articlesData?.articles || [];

  // Fetch assignments for the table
  const { data: assignmentsData, isLoading: isAssignmentsLoading, isError, refetch } = useQuery({
    queryKey: ['admin-assignments'],
    queryFn: async () => {
      const res = await axiosInstance.get('/assignments/admin');
      return res.data;
    },
  });

  // assignmentsData is already the data array because queryFn returns res.data
  const assignments = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.data || []);

  const assignedArticleIds = assignments.map(a => a.articleId?._id || a.articleId);
  const availableArticles = articles.filter(article => !assignedArticleIds.includes(article._id));

  const createMutation = useMutation({
    mutationFn: async (newAssignment) => {
      const res = await axiosInstance.post('/assignments', newAssignment);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Assignment created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      setIsFormVisible(false);
      setFormData(initialFormData);
      setQuestions([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create assignment');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await axiosInstance.put(`/assignments/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Assignment updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      setIsFormVisible(false);
      setEditingId(null);
      setFormData(initialFormData);
      setQuestions([]);
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update assignment');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosInstance.delete(`/assignments/${id}`);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Assignment deleted/archived successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete assignment');
    },
  });

  const handleEdit = (assignment) => {
    setFormData({
      articleId: assignment.articleId?._id || assignment.articleId,
      title: assignment.title,
      instructions: assignment.instructions,
      totalMarks: assignment.totalMarks,
      maxAttempts: assignment.maxAttempts || 3,
      status: assignment.status || 'active'
    });
    setQuestions(assignment.questions || []);
    setEditingId(assignment._id);
    setIsFormVisible(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this assignment? If it has submissions, it will be archived (marked inactive) instead of permanently deleted.')) {
      deleteMutation.mutate(id);
    }
  };

  const cancelForm = () => {
    setIsFormVisible(false);
    setEditingId(null);
    setFormData(initialFormData);
    setQuestions([]);
  };

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
            label: String.fromCharCode(65 + i), // Re-assign letters
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
          return {
            ...q,
            options: q.options.map((opt, oIdx) =>
              oIdx === optionIndex ? { ...opt, isCorrect: !opt.isCorrect } : opt
            ),
          };
        } else {
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

    const payload = {
      ...formData,
      totalMarks,
      maxAttempts: Number(formData.maxAttempts),
      questions: questions.map((question) => ({
        ...question,
        marks: Number(question.marks),
      })),
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileQuestion size={20} />
          {isFormVisible ? (editingId ? 'Edit Assignment' : 'New Assignment') : 'Manage Assignments'}
        </h2>

        {!isFormVisible && (
          <div className="flex flex-col items-end">
            <button
              type="button"
              onClick={() => setIsFormVisible(true)}
              disabled={availableArticles.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              New Assignment
            </button>
            {availableArticles.length === 0 && assignments.length > 0 && (
              <span className="text-xs text-red-500 mt-1 max-w-[200px] text-right">
                All published articles already have assignments. Edit or archive an existing assignment instead.
              </span>
            )}
          </div>
        )}
      </div>

      {!isFormVisible ? (
        <div className="bg-white rounded border shadow-sm overflow-hidden">
          {isAssignmentsLoading ? (
            <div className="p-12 text-center text-gray-500 animate-pulse">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              Loading assignments...
            </div>
          ) : isError ? (
            <div className="p-12 text-center text-red-500">
              Failed to load assignments. <button onClick={refetch} className="underline font-medium hover:text-red-700">Retry</button>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <FileQuestion size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="font-medium text-lg text-gray-700">No assignments yet</p>
              <p className="mt-1">Click "New Assignment" to create your first one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 border-b">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Title</th>
                    <th className="px-4 py-3 font-semibold">Target Article</th>
                    <th className="px-4 py-3 font-semibold text-center">Questions</th>
                    <th className="px-4 py-3 font-semibold text-center">Marks / Attempts</th>
                    <th className="px-4 py-3 font-semibold text-center">Status</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {assignments.map(a => (
                    <tr key={a._id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-4 py-4 font-medium text-gray-900">{a.title}</td>
                      <td className="px-4 py-4 text-gray-500 truncate max-w-[200px]" title={a.articleId?.title}>
                        {a.articleId?.title || <span className="text-red-400 italic">Orphaned</span>}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-medium border border-gray-200">
                          {a.questions?.length || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">{a.totalMarks} Marks</span>
                        <span className="text-gray-400 mx-2">•</span>
                        <span className="text-xs text-gray-500">{a.maxAttempts ? `${a.maxAttempts} max` : 'Unlimited'}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${a.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                          {a.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(a)} 
                            className="text-blue-600 bg-blue-50 hover:bg-blue-100 p-2 rounded transition-colors" 
                            title="Edit Assignment"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(a._id)} 
                            disabled={deleteMutation.isPending} 
                            className="text-red-500 bg-red-50 hover:bg-red-100 p-2 rounded transition-colors disabled:opacity-50" 
                            title="Delete or Archive"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded border border-gray-200 shadow-sm space-y-6 animate-in fade-in duration-300"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Target Article</label>
              <select
                required
                className={`w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={formData.articleId}
                disabled={isArticlesLoading || editingId !== null}
                onChange={(e) => setFormData({ ...formData, articleId: e.target.value })}
              >
                <option value="">{isArticlesLoading ? 'Loading articles...' : 'Select an Article'}</option>
                {editingId 
                  ? articles.filter(a => a._id === formData.articleId).map(article => (
                      <option key={article._id} value={article._id}>{article.title}</option>
                    ))
                  : availableArticles.map((article) => (
                      <option key={article._id} value={article._id}>{article.title}</option>
                    ))
                }
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Title</label>
              <input
                required
                type="text"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g., Midterm AI Assessment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Max Attempts</label>
              <input
                required
                min="1"
                type="number"
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.maxAttempts}
                onChange={(e) => setFormData({ ...formData, maxAttempts: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Total Marks (Auto)</label>
              <input
                disabled
                type="number"
                className="w-full border border-gray-200 p-2 rounded bg-gray-100 text-gray-500 cursor-not-allowed"
                value={questions.reduce((sum, question) => sum + Number(question.marks || 0), 0)}
              />
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
              <select
                className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="active">Active (Visible to Learners)</option>
                <option value="inactive">Inactive / Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Instructions</label>
            <textarea
              required
              className="w-full border border-gray-300 p-3 rounded min-h-[90px] focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              placeholder="Write clear instructions for the learners..."
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-between items-center gap-4 mb-4">
              <h3 className="font-bold text-lg text-gray-800">Questions Build Area</h3>
              <p className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                {questions.length} Question{questions.length !== 1 && 's'}
              </p>
            </div>

            {questions.length === 0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500 bg-gray-50 mb-6">
                <FileQuestion className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="font-medium text-gray-700">No questions added yet</p>
                <p className="text-sm mt-1">Select a question type from the buttons below to build your assignment.</p>
              </div>
            )}

            <div className="space-y-6 mb-6">
              {questions.map((q, i) => (
                <div key={i} className="bg-white p-5 border border-gray-200 shadow-sm rounded-xl relative">
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                    title="Remove question"
                  >
                    <Trash size={18} />
                  </button>

                  <div className="pr-12 mb-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-2">
                      {q.type.replace('_', ' ')}
                    </label>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-lg text-gray-400 mt-1.5">{i + 1}.</span>
                      <textarea
                        required
                        placeholder="Type your question here..."
                        className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none resize-y min-h-[60px]"
                        value={q.questionText}
                        onChange={(e) => updateQuestionField(i, 'questionText', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-48 mb-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Marks awarded</label>
                    <div className="relative">
                      <input
                        required
                        min="1"
                        type="number"
                        className="w-full border border-gray-300 p-2 pl-3 pr-10 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                        value={q.marks}
                        onChange={(e) => updateQuestionField(i, 'marks', e.target.value)}
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm font-medium">pts</span>
                    </div>
                  </div>

                  {['mcq', 'msq', 'true_false'].includes(q.type) && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        Options <span className="lowercase font-normal text-gray-400">{q.type === 'msq' ? '(select all correct)' : '(select exactly one correct)'}</span>
                      </p>

                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={opt.label} className={`flex items-center gap-3 p-2 rounded border transition-colors ${opt.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center justify-center w-6">
                              <input
                                type={q.type === 'msq' ? 'checkbox' : 'radio'}
                                name={`correct-${i}-${q.type === 'msq' ? oIdx : ''}`}
                                checked={opt.isCorrect}
                                onChange={() => toggleCorrectOption(i, oIdx)}
                                className="w-4 h-4 cursor-pointer text-green-600 focus:ring-green-500 border-gray-300"
                              />
                            </div>

                            <span className="font-bold text-gray-600 w-5">
                              {opt.label}.
                            </span>

                            <input
                              required
                              placeholder={`Type option ${opt.label} text`}
                              className="flex-1 border-0 bg-transparent p-1 focus:ring-0 outline-none text-sm disabled:text-gray-500"
                              value={opt.text}
                              onChange={(e) => updateOptionText(i, oIdx, e.target.value)}
                              disabled={q.type === 'true_false'}
                            />

                            {q.type !== 'true_false' && q.options.length > (q.type === 'msq' ? 4 : 2) && (
                              <button
                                type="button"
                                onClick={() => removeOption(i, oIdx)}
                                className="text-gray-400 hover:text-red-500 p-1"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {q.type !== 'true_false' && (
                        <button
                          type="button"
                          onClick={() => addOption(i)}
                          className="text-xs text-blue-600 font-bold flex items-center gap-1 mt-3 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded"
                        >
                          <Plus size={14} /> Add Option
                        </button>
                      )}
                    </div>
                  )}

                  {q.type === 'short_answer' && (
                    <div className="space-y-4 bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                      <div>
                        <label className="block text-xs font-bold text-purple-700 mb-1 uppercase tracking-wider">Expected Answer</label>
                        <p className="text-xs text-purple-600 mb-2">The AI model will use this as the golden standard to grade the student's submission.</p>
                        <textarea
                          required
                          placeholder="Provide the ideal answer here..."
                          className="w-full border border-purple-200 p-3 rounded text-sm min-h-[90px] focus:ring-2 focus:ring-purple-500 outline-none"
                          value={q.expectedAnswer}
                          onChange={(e) => updateQuestionField(i, 'expectedAnswer', e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-purple-700 mb-1 uppercase tracking-wider">Grading Rubric <span className="font-normal text-purple-500 lowercase">(Optional)</span></label>
                        <input
                          placeholder="e.g. 'Award half points if they mention X but not Y'"
                          className="w-full border border-purple-200 p-2 rounded text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                          value={q.rubric}
                          onChange={(e) => updateQuestionField(i, 'rubric', e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Add a new question:</p>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => addQuestion('true_false')} className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-100 transition-colors shadow-sm">
                  + True / False
                </button>
                <button type="button" onClick={() => addQuestion('mcq')} className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-100 transition-colors shadow-sm">
                  + MCQ <span className="font-normal text-gray-500">(Single Answer)</span>
                </button>
                <button type="button" onClick={() => addQuestion('msq')} className="border border-gray-300 px-4 py-2 text-sm font-medium rounded-lg bg-white hover:bg-gray-100 transition-colors shadow-sm">
                  + MSQ <span className="font-normal text-gray-500">(Multiple Answers)</span>
                </button>
                <button type="button" onClick={() => addQuestion('short_answer')} className="border border-purple-200 px-4 py-2 text-sm font-medium rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors shadow-sm">
                  + AI Short Answer
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              disabled={isSaving}
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold disabled:opacity-60 transition-colors flex items-center gap-2 shadow-sm"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              {editingId ? 'Save Changes' : 'Publish Assignment'}
            </button>
            <button
              type="button"
              onClick={cancelForm}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminAssignments;