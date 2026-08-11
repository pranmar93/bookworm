import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookService from '../services/bookService';
import BookGrid from '../components/catalog/BookGrid';
import CategorySidebar from '../components/catalog/CategorySidebar';
import { useAuth } from '../hooks/useAuth';

const Section = ({ title, books, loading }) => (
  <section className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <Link to="/catalog" className="text-sm text-blue-800 font-medium hover:underline">View All</Link>
    </div>
    <BookGrid books={books} loading={loading} columns={4} />
  </section>
);

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [data, setData] = useState({
    recommended: [], bestsellers: [], newLaunches: [], categories: [],
  });
  const [loadingMap, setLoadingMap] = useState({
    recommended: true, bestsellers: true, newLaunches: true,
  });

  useEffect(() => {
    const loadSection = async (key, params) => {
      try {
        let books;
        if (key === 'recommended' && isAuthenticated) {
          const res = await bookService.getRecommendations();
          books = res.data;
        } else {
          const res = await bookService.getBooks({ ...params, limit: 8 });
          books = res.data.books;
        }
        setData((prev) => ({ ...prev, [key]: books }));
      } catch {
        // silent
      } finally {
        setLoadingMap((prev) => ({ ...prev, [key]: false }));
      }
    };

    bookService.getCategories().then((res) => {
      setData((prev) => ({ ...prev, categories: res.data }));
    }).catch(() => {});

    loadSection('recommended', { recommended: 'true' });
    loadSection('bestsellers', { bestseller: 'true' });
    loadSection('newLaunches', { new_launch: 'true' });
  }, [isAuthenticated]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 text-white mb-10 overflow-hidden">
        <div className="p-8 md:p-12">
          <p className="text-blue-200 text-sm font-semibold tracking-wider uppercase mb-3">Welcome to BookWorm</p>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Discover Your<br />Next Great Read
          </h1>
          <p className="text-blue-100 text-lg mb-6 max-w-xl">
            Browse over 50 titles across every genre. From timeless classics to new releases.
          </p>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Browse Books
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden lg:block w-56 shrink-0">
          <CategorySidebar
            categories={data.categories}
            selectedCategoryId=""
            onSelectCategory={(id) => {
              const cat = data.categories.find((c) => c.category_id === id);
              if (cat) {
                window.location.href = `/catalog?category=${id}`;
              } else {
                window.location.href = '/catalog';
              }
            }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <Section title="📖 Recommended For You" books={data.recommended} loading={loadingMap.recommended} />
          <Section title="⭐ Bestsellers" books={data.bestsellers} loading={loadingMap.bestsellers} />
          <Section title="🆕 New Launches" books={data.newLaunches} loading={loadingMap.newLaunches} />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
