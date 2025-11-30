import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import './BookReviewPage.css';

export default function BookReviewsPage() {
  const { bookId: routeBookId } = useParams();
  const { user, isAuth } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [newReview, setNewReview] = useState({ 
    reviewText: '', 
    rating: 0, 
    bookId: '',
    bookTitle: '' 
  });
  const [saving, setSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [searchingBooks, setSearchingBooks] = useState(false);

  const loadBookTitles = async (reviewList) => {
    const bookIds = [...new Set(reviewList.map(review => review.bookId))];
    const booksMap = {};
    
    for (const bookId of bookIds) {
      try {
        const bookData = await bookService.getBookById(bookId);
        booksMap[bookId] = bookData.title || `Книга #${bookId}`;
      } catch (err) {
        console.error(`Ошибка при загрузке книги ${bookId}:`, err);
        booksMap[bookId] = `Книга #${bookId}`;
      }
    }
    
    setBooks(booksMap);
  };

  const searchBooks = async (query) => {
    if (!query.trim()) {
      setBookSearchResults([]);
      return;
    }

    setSearchingBooks(true);
    try {
      const allBooks = await bookService.getAllBooks();
      const filteredBooks = allBooks.filter(book => 
        book.title.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);
      
      setBookSearchResults(filteredBooks);
    } catch (err) {
      console.error('Ошибка при поиске книг:', err);
      setBookSearchResults([]);
    } finally {
      setSearchingBooks(false);
    }
  };

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const data = routeBookId
        ? await reviewService.getByBook(routeBookId)
        : await reviewService.getAll();
      setReviews(data);
      
      await loadBookTitles(data);
    } catch (err) {
      setError('Ошибка при загрузке отзывов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuth || !user?.id) {
      setReviews([]);
      setLoading(false);
      setError('Пользователь не авторизован');
      return;
    }
    loadReviews();
  }, [user, isAuth, routeBookId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewReview(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));

    if (name === 'bookTitle') {
      searchBooks(value);
    }
  };

  const handleBookSelect = (book) => {
    setNewReview(prev => ({
      ...prev,
      bookId: book.id,
      bookTitle: book.title
    }));
    setBookSearchResults([]);
  };

  const handleCreate = async () => {
    if (!newReview.reviewText.trim() || newReview.rating <= 0 || !newReview.bookId) {
      setError('Заполните текст, оценку и выберите книгу');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await reviewService.create({
        reviewText: newReview.reviewText,
        rating: newReview.rating,
        bookId: newReview.bookId,
        userId: user.id,
        isVerified: false
      });
      setNewReview({ reviewText: '', rating: 0, bookId: '', bookTitle: '' });
      setShowAddModal(false);
      setBookSearchResults([]);
      await loadReviews();
    } catch {
      setError('Ошибка при создании отзыва');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить отзыв?')) return;
    try {
      await reviewService.delete(id);
      await loadReviews();
    } catch {
      setError('Ошибка при удалении');
    }
  };

  const getBookTitle = (review) => {
    return books[review.bookId] || review.bookTitle || `Книга #${review.bookId}`;
  };

  if (!isAuth) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <p>Вы не авторизованы</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="loading">Загрузка отзывов...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeSection="reviews"
        user={user}
      />

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="reviews-page-container">
          <div className="page-header">
            <h1>{routeBookId ? `Отзывы на книгу "${books[routeBookId] || `#${routeBookId}`}"` : 'Все отзывы'}</h1>
            <Button variant="filled" onClick={() => setShowAddModal(true)}>
              Добавить отзыв
            </Button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="reviews-section">
            <h3>Отзывы ({reviews.length})</h3>
            {reviews.length > 0 ? (
              <ul className="reviews-list">
                {reviews.map(review => (
                  <li
                    key={review.id}
                    className="review-item"
                    onClick={() => navigate(`/review/${review.id}`)}
                  >
                    <div className="review-content">
                      <div className="review-header">
                        <h4 className="review-title">{getBookTitle(review)}</h4>
                        <span className="review-rating">
                          {Array.from({ length: 5 }, (_, i) => (
                            <span 
                              key={i} 
                              className={i < review.rating ? 'star-filled' : 'star-empty'}
                            >
                              ⭐
                            </span>
                          ))}
                          <span className="rating-text">({review.rating}/5)</span>
                        </span>
                      </div>
                      <p className="review-text">
                        {review.reviewText.length > 150 
                          ? `${review.reviewText.substring(0, 150)}...` 
                          : review.reviewText
                        }
                      </p>
                      <div className="review-meta">
                        <span>{review.createdAt && new Date(review.createdAt).toLocaleDateString('ru-RU')}</span>
                        {review.isVerified && (
                          <>
                            <span className="verified-badge">Проверен</span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>Пока нет отзывов</p>
                <p className="empty-state-hint">Будьте первым, кто оставит отзыв!</p>
              </div>
            )}
          </div>

          {showAddModal && (
            <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Добавить отзыв</h2>

                <div className="form-group">
                  <label htmlFor="bookTitle">Книга *</label>
                  <input
                    id="bookTitle"
                    name="bookTitle"
                    className="form-input"
                    value={newReview.bookTitle}
                    onChange={handleInputChange}
                    placeholder="Начните вводить название книги..."
                  />
                  {bookSearchResults.length > 0 && (
                    <div className="book-search-results">
                      {bookSearchResults.map(book => (
                        <div
                          key={book.id}
                          className="book-search-item"
                          onClick={() => handleBookSelect(book)}
                        >
                          <span className="book-title">{book.title}</span>
                          <span className="book-authors">{book.authors?.join(', ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchingBooks && (
                    <div className="search-loading">Поиск книг...</div>
                  )}
                  {newReview.bookId && (
                    <div className="selected-book">
                      Выбрана: <strong>{newReview.bookTitle}</strong>
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="reviewText">Текст отзыва *</label>
                  <textarea
                    id="reviewText"
                    name="reviewText"
                    className="form-textarea"
                    value={newReview.reviewText}
                    onChange={handleInputChange}
                    placeholder="Поделитесь вашим мнением о книге..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rating">Оценка (1-5) *</label>
                  <div className="rating-selector">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`rating-star ${newReview.rating >= star ? 'selected' : ''}`}
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      >
                        ⭐
                      </button>
                    ))}
                    <span className="rating-text">({newReview.rating}/5)</span>
                  </div>
                </div>

                <div className="form-actions">
                  <Button 
                    variant="filled" 
                    onClick={handleCreate}
                    disabled={saving || !newReview.reviewText.trim() || newReview.rating <= 0 || !newReview.bookId}
                  >
                    {saving ? 'Добавление...' : 'Добавить отзыв'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setShowAddModal(false);
                      setBookSearchResults([]);
                    }}
                    disabled={saving}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}