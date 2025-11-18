import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import reviewService from '../../services/reviewService';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import './BookReviewFormPage.css';

export default function BookReviewFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [review, setReview] = useState(null);
  const [bookTitle, setBookTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    bookId: '',
    rating: 0,
    reviewText: ''
  });

  // Функция для загрузки названия книги
  const loadBookTitle = async (bookId) => {
    if (!bookId) return '';
    
    try {
      const bookData = await bookService.getBookById(bookId);
      return bookData.title || `Книга #${bookId}`;
    } catch (bookError) {
      console.error('Ошибка при загрузке книги:', bookError);
      return `Книга #${bookId}`;
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setError('Пользователь не авторизован');
      setLoading(false);
      return;
    }

    const loadReviewData = async () => {
      try {
        // Загружаем отзыв
        const reviewData = await reviewService.getById(id);
        setReview(reviewData);
        setFormData({
          bookId: reviewData.bookId || '',
          rating: reviewData.rating,
          reviewText: reviewData.reviewText || ''
        });

        // Загружаем название книги
        if (reviewData.bookId) {
          const title = await loadBookTitle(reviewData.bookId);
          setBookTitle(title);
        } else if (reviewData.bookTitle) {
          // Если название уже есть в отзыве, используем его
          setBookTitle(reviewData.bookTitle);
        }
      } catch (err) {
        console.error('Ошибка при загрузке отзыва:', err);
        setError('Ошибка при загрузке отзыва');
      } finally {
        setLoading(false);
      }
    };

    loadReviewData();
  }, [id, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (formData.rating < 1 || formData.rating > 5) {
      errors.rating = 'Оценка должна быть от 1 до 5';
    }
    if (!formData.reviewText.trim()) {
      errors.reviewText = 'Текст отзыва обязателен';
    }
    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setError('');

    try {
      await reviewService.update(id, {
        reviewText: formData.reviewText.trim(),
        rating: formData.rating
      });
      
      // Обновляем данные отзыва
      const updatedReview = await reviewService.getById(id);
      setReview(updatedReview);
      setIsEditing(false);
      setFieldErrors({});
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Ошибка при сохранении отзыва');
      // Восстанавливаем исходные данные при ошибке
      if (review) {
        setFormData({
          bookId: review.bookId,
          rating: review.rating,
          reviewText: review.reviewText
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (review) {
      setFormData({
        bookId: review.bookId,
        rating: review.rating,
        reviewText: review.reviewText
      });
    }
    setIsEditing(false);
    setError('');
    setFieldErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
      return;
    }

    try {
      await reviewService.delete(id);
      navigate('/reviews');
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      setError('Ошибка при удалении отзыва');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Получаем отображаемое название книги
  const displayBookTitle = bookTitle || 
                          (review?.bookTitle ? review.bookTitle : `Книга #${review?.bookId || ''}`);

  if (!user) {
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
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection="reviews" />
        <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="loading">Загрузка отзыва...</div>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection="reviews" />
        <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="error-message">Отзыв не найден</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection="reviews" />

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="review-details-page">
          {error && <div className="error-message">{error}</div>}

          {!isEditing ? (
            <>
              <h1>Отзыв на книгу "{displayBookTitle}"</h1>

              <div className="review-rating-big">
                {Array.from({ length: 5 }, (_, i) => (
                  <span 
                    key={i} 
                    className={i < review.rating ? 'star-filled' : 'star-empty'}
                  >
                    ⭐
                  </span>
                ))}
                <span className="rating-text">({review.rating}/5)</span>
              </div>

              <div className="review-full-text">
                {review.reviewText || 'Текст отзыва отсутствует'}
              </div>

              <div className="review-meta-details">
                <p><strong>Книга:</strong> {displayBookTitle}</p>
                <p><strong>Пользователь:</strong> {review.userName || `#${review.userId}`}</p>
                <p><strong>Статус:</strong> {review.isVerified ? 'Проверен' : 'Ожидает проверки'}</p>
              </div>

              <div className="review-actions">
              {user.role === 'Admin' && (
                <>
                  <Button 
                    variant="filled" 
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                  <Button 
                    variant="danger" 
                    onClick={handleDelete}
                  >
                    Удалить
                  </Button>
                </>
              )}

              <Button 
                variant="outlined" 
                onClick={() => navigate(`/books/${review.bookId}`)}
              >
                📖 Перейти к книге
              </Button>

              <Button 
                variant="outlined" 
                onClick={() => navigate('/reviews')}
              >
                ← Назад к отзывам
              </Button>
            </div>

            </>
          ) : (
            <div className="review-edit-form">
              <h1>Редактирование отзыва</h1>

              <div className="form-group">
                <label htmlFor="bookId">Книга</label>
                <input 
                  type="text" 
                  id="bookId" 
                  name="bookId" 
                  disabled 
                  className="form-input" 
                  value={displayBookTitle} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="rating">Оценка (1-5) *</label>
                <input
                  type="number"
                  id="rating"
                  name="rating"
                  min="1"
                  max="5"
                  className={`form-input ${fieldErrors.rating ? 'input-error' : ''}`}
                  value={formData.rating}
                  onChange={handleInputChange}
                  placeholder="5"
                />
                {fieldErrors.rating && (
                  <p className="field-error">{fieldErrors.rating}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reviewText">Текст отзыва *</label>
                <textarea
                  id="reviewText"
                  name="reviewText"
                  rows="6"
                  className={`form-textarea ${fieldErrors.reviewText ? 'input-error' : ''}`}
                  value={formData.reviewText}
                  onChange={handleInputChange}
                  placeholder="Подробно опишите ваше мнение о книге..."
                />
                {fieldErrors.reviewText && (
                  <p className="field-error">{fieldErrors.reviewText}</p>
                )}
              </div>

              <div className="form-actions">
                <Button 
                  variant="filled" 
                  onClick={handleSave} 
                  disabled={saving}
                >
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancel} 
                  disabled={saving}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}