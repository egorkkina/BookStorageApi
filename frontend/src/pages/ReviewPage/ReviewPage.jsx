import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import reviewService from '../../services/reviewService';
import './ReviewPage.css';

function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const reviewsData = await reviewService.getAllReviews();
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setError('Ошибка при загрузке отзывов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReview = () => {
    navigate('/reviews/create');
  };

  if (loading) {
    return <div className="loading">Загрузка отзывов...</div>;
  }

  return (
    <div className="reviews-page">
      <div className="page-header">
        <h1>Отзывы на книги</h1>
        <Button variant="filled" onClick={handleCreateReview}>
          Написать отзыв
        </Button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="reviews-list">
        {reviews.map(review => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <span className="review-rating">⭐ {review.rating}/5</span>
              {review.isVerified && <span className="verified-badge">✓ Проверено</span>}
            </div>
            <p className="review-text">{review.reviewText}</p>
            <div className="review-footer">
              <span>Книга ID: {review.bookId}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewsPage;