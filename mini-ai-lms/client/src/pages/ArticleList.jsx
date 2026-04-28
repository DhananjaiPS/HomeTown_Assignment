import React, { useState } from 'react';
import { useArticles } from '../hooks/useArticles';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, Tag } from 'lucide-react';

const ArticleList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // for debounce later if needed, but direct is ok for now
  
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const { data, isLoading, isError } = useArticles(page, search);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Explore Articles</h1>
          <p className="text-gray-500 mt-1">Discover new topics and complete assignments.</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search articles..." 
              className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
            Search
          </button>
        </form>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border h-64 animate-pulse"></div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-12 text-red-500">Failed to load articles.</div>
      ) : data.articles.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-700">No articles found</h3>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.articles.map(article => (
              <Link to={`/articles/${article.slug}`} key={article._id} className="bg-card group hover:shadow-md transition-shadow rounded-xl border border-border overflow-hidden flex flex-col">
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize 
                      ${article.difficulty === 'beginner' ? 'bg-green-100 text-green-700' : 
                        article.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'}`}>
                      {article.difficulty}
                    </span>
                    <span className="flex items-center text-xs text-gray-500 gap-1"><Clock size={14}/> {article.readingTimeMinutes} min</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3">{article.content}</p>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {article.createdBy?.name?.charAt(0) || 'A'}
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{article.createdBy?.name || 'Admin'}</span>
                  </div>
                  {article.tags?.length > 0 && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Tag size={12}/> {article.tags[0]}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              <button 
                disabled={page === 1} 
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 border border-border rounded-md bg-card hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button 
                disabled={page === data.pages} 
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 border border-border rounded-md bg-card hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ArticleList;
