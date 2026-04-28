import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../../api/axios';
import toast from 'react-hot-toast';
import { Plus, Trash, Edit, BookOpen } from 'lucide-react';

const AdminArticles = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', difficulty: 'beginner', readingTimeMinutes: 5, tags: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-articles', page],
    queryFn: async () => {
      const res = await axiosInstance.get(`/articles?page=${page}&limit=10`);
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (newArticle) => {
      const res = await axiosInstance.post('/articles', newArticle);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Article created');
      queryClient.invalidateQueries(['admin-articles']);
      setIsCreating(false);
      setFormData({ title: '', content: '', difficulty: 'beginner', readingTimeMinutes: 5, tags: '' });
    },
    onError: (err) => toast.error(err.message || 'Failed to create article')
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedArticle) => {
      const res = await axiosInstance.put(`/articles/${editingId}`, updatedArticle);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Article updated');
      queryClient.invalidateQueries(['admin-articles']);
      setIsCreating(false);
      setEditingId(null);
      setFormData({ title: '', content: '', difficulty: 'beginner', readingTimeMinutes: 5, tags: '' });
    },
    onError: (err) => toast.error(err.message || 'Failed to update article')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await axiosInstance.delete(`/articles/${id}`);
    },
    onSuccess: () => {
      toast.success('Article deleted');
      queryClient.invalidateQueries(['admin-articles']);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      tags: typeof formData.tags === 'string' ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : formData.tags
    };
    if (editingId) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isLoading) return <div className="p-8 text-center"><div className="loader inline-block"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen size={20}/> Manage Articles</h2>
        <button 
          onClick={() => {
            const nextState = !isCreating;
            setIsCreating(nextState);
            if (!nextState) {
              setEditingId(null);
              setFormData({ title: '', content: '', difficulty: 'beginner', readingTimeMinutes: 5, tags: '' });
            }
          }}
          className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2 text-sm font-medium hover:bg-blue-600"
        >
          <Plus size={16}/> {isCreating ? 'Cancel' : 'New Article'}
        </button>
      </div>

      {isCreating && (
        <form onSubmit={handleSubmit} className="bg-card p-6 rounded border border-border shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input required type="text" className="w-full border p-2 rounded" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content</label>
            <textarea required className="w-full border p-2 rounded h-32" value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})}></textarea>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Difficulty</label>
              <select className="w-full border p-2 rounded" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reading Time (mins)</label>
              <input required type="number" className="w-full border p-2 rounded" value={formData.readingTimeMinutes} onChange={e => setFormData({...formData, readingTimeMinutes: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
              <input type="text" className="w-full border p-2 rounded" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} />
            </div>
          </div>
          <button disabled={createMutation.isPending || updateMutation.isPending} type="submit" className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium">{editingId ? 'Update Article' : 'Save Article'}</button>
        </form>
      )}

      <div className="bg-card border border-border rounded overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-border">
            <tr>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Difficulty</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data?.articles?.map(article => (
              <tr key={article._id} className="hover:bg-gray-50">
                <td className="p-4 font-medium">{article.title}</td>
                <td className="p-4 capitalize text-gray-600">{article.difficulty}</td>
                <td className="p-4 text-gray-500">{new Date(article.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  <button onClick={() => {
                     setEditingId(article._id);
                     setFormData({
                       title: article.title,
                       content: article.content,
                       difficulty: article.difficulty,
                       readingTimeMinutes: article.readingTimeMinutes,
                       tags: article.tags ? article.tags.join(', ') : ''
                     });
                     setIsCreating(true);
                  }} className="text-blue-500 hover:text-blue-700 p-1 bg-blue-50 rounded"><Edit size={16}/></button>
                  <button onClick={() => {
                     if(window.confirm('Delete article?')) deleteMutation.mutate(article._id);
                  }} className="text-red-500 hover:text-red-700 p-1 bg-red-50 rounded"><Trash size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.pages > 1 && (
          <div className="p-4 flex gap-2 justify-center bg-gray-50">
             <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">Prev</button>
             <button disabled={page===data.pages} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 border rounded disabled:opacity-50 text-sm">Next</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminArticles;
