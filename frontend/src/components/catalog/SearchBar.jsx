import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      navigate(`/catalog?q=${encodeURIComponent(q)}`);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      className="flex w-full items-center bg-white/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-white/50 transition-all"
    >
      <label htmlFor="global-search" className="sr-only">Search books</label>
      <input
        id="global-search"
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search books, authors..."
        className="flex-1 bg-transparent text-white placeholder-blue-200 text-sm px-4 py-2.5 focus:outline-none"
        autoComplete="off"
      />
      <button
        type="submit"
        className="px-4 py-2.5 text-blue-200 hover:text-white transition-colors"
        aria-label="Search"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </form>
  );
};

export default SearchBar;
