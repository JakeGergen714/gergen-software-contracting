import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiFileText,
  FiLayers,
  FiCheckSquare,
  FiBox,
} from 'react-icons/fi';
import { useServices } from '../../context/ServiceContext';
import { SearchResult } from '../../types/domain';

export function GlobalSearch() {
  const { search } = useServices();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setLoading(true);
        try {
          const data = await search.search(query);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          console.error('Search failed', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, search]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');

    if (result.type === 'PROJECT') {
      navigate(`/admin/projects/${result.id}`);
    } else if (result.type === 'EPIC') {
      navigate(`/admin/projects/${result.projectId}/epics`);
      // Ideally open the epic modal
    } else if (result.type === 'STORY') {
      navigate(`/admin/projects/${result.projectId}/sprint/backlog`);
      // Ideally open the story modal
    } else if (result.type === 'DOC') {
      // Navigate to docs or download
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'PROJECT':
        return <FiBox className='text-blue-500' />;
      case 'EPIC':
        return <FiLayers className='text-purple-500' />;
      case 'STORY':
        return <FiCheckSquare className='text-green-500' />;
      case 'DOC':
        return <FiFileText className='text-orange-500' />;
      default:
        return <FiSearch />;
    }
  };

  return (
    <div className='relative flex-1 max-w-xl' ref={wrapperRef}>
      <label className='flex items-center gap-3 rounded-full border border-border-subtle bg-surface px-4 py-2 text-sm text-text-muted shadow-card focus-within:ring-2 focus-within:ring-brand/30'>
        <FiSearch className='text-text-faint' aria-hidden />
        <input
          type='search'
          placeholder='Search projects, stories, docs...'
          className='flex-1 bg-transparent text-text-primary placeholder:text-text-faint focus:outline-none'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        {loading && (
          <div className='h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600' />
        )}
      </label>

      {isOpen && results.length > 0 && (
        <div className='absolute top-full left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-border-subtle bg-white shadow-xl z-50'>
          <div className='p-2'>
            {results.map((result) => (
              <button
                key={result.id + result.type}
                onClick={() => handleSelect(result)}
                className='flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-slate-50 transition-colors'
              >
                <div className='mt-0.5'>{getIcon(result.type)}</div>
                <div>
                  <p className='text-sm font-semibold text-slate-900'>
                    {result.title}
                  </p>
                  <p className='text-xs text-slate-500 line-clamp-1'>
                    {result.description}
                  </p>
                  {result.projectName && (
                    <p className='text-[10px] uppercase tracking-wide text-slate-400 mt-1'>
                      {result.projectName}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && query.length >= 2 && !loading && (
        <div className='absolute top-full left-0 right-0 mt-2 rounded-xl border border-border-subtle bg-white shadow-xl z-50 p-4 text-center text-sm text-slate-500'>
          No results found.
        </div>
      )}
    </div>
  );
}
