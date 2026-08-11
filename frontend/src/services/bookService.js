import api from './api';

const bookService = {
  /** Get books with optional filters */
  getBooks: (params = {}) => api.get('/books', { params }),
  /** Get single book */
  getBook: (bookId) => api.get(`/books/${bookId}`),
  /** Get related books */
  getRelated: (bookId) => api.get(`/books/${bookId}/related`),
  /** Search books */
  search: (q, params = {}) => api.get('/books/search', { params: { q, ...params } }),
  /** Get book reviews */
  getReviews: (bookId) => api.get(`/books/${bookId}/reviews`),
  /** Get all categories */
  getCategories: () => api.get('/categories'),
  /** Get books by category */
  getCategoryBooks: (categoryId, params = {}) =>
    api.get(`/categories/${categoryId}/books`, { params }),
  /** Get author */
  getAuthor: (authorId) => api.get(`/authors/${authorId}`),
  /** Get author books */
  getAuthorBooks: (authorId) => api.get(`/authors/${authorId}/books`),
  /** Get recommendations */
  getRecommendations: () => api.get('/recommendations'),
};

export default bookService;
