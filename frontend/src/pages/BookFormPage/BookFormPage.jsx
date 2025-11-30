import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import bookService from '../../services/bookService';
import reviewService from '../../services/reviewService';
import readingListService from '../../services/readingListService';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import './BookFormPage.css';

export default function BookFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authors: [''],
    price: 0
  });

  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Новые состояния для функционала списков чтения
  const [userReadingLists, setUserReadingLists] = useState([]);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [selectedListId, setSelectedListId] = useState('');
  const [addingToList, setAddingToList] = useState(false);
  const [listOperationMessage, setListOperationMessage] = useState('');

  // Загрузка списков пользователя
  const loadUserReadingLists = async () => {
    if (!user?.id) return;
    
    try {
      const lists = await readingListService.getByUser(user.id);
      setUserReadingLists(lists);
    } catch (err) {
      console.error('Ошибка при загрузке списков пользователя:', err);
    }
  };

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const data = await reviewService.getByBook(id);
      setReviews(data);
    } catch (err) {
      console.error('Ошибка загрузки отзывов:', err);
      setError('Ошибка загрузки отзывов');
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    const loadBook = async () => {
      try {
        const data = await bookService.getBookById(id);
        setBook(data);

        setFormData({
          title: data.title || '',
          description: data.description || '',
          authors: data.authors?.length > 0 ? data.authors : [''],
          price: data.price || 0
        });
      } catch (err) {
        console.error('Ошибка при загрузке книги:', err);
        setError('Ошибка при загрузке книги');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
    loadUserReadingLists();
  }, [id, user]);

  // Функция добавления книги в список
  const handleAddToReadingList = async () => {
    if (!selectedListId) {
      setListOperationMessage('Выберите список для чтения');
      return;
    }

    setAddingToList(true);
    setListOperationMessage('');
    
    try {
      await readingListService.addBook(selectedListId, id);
      setListOperationMessage('Книга успешно добавлена в список!');
      
      // Закрываем модальное окно через 2 секунды
      setTimeout(() => {
        setShowAddToListModal(false);
        setSelectedListId('');
        setListOperationMessage('');
      }, 2000);
    } catch (err) {
      console.error('Ошибка при добавлении книги в список:', err);
      setListOperationMessage('Ошибка при добавлении книги в список');
    } finally {
      setAddingToList(false);
    }
  };

  // Остальные функции остаются без изменений...
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAuthorChange = (index, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index] = value;
    setFormData(prev => ({ ...prev, authors: newAuthors }));
    
    if (fieldErrors.authors) {
      setFieldErrors(prev => ({ ...prev, authors: null }));
    }
  };

  const addAuthorField = () =>
    setFormData(prev => ({ ...prev, authors: [...prev.authors, ''] }));

  const removeAuthorField = (index) => {
    if (formData.authors.length > 1) {
      setFormData(prev => ({
        ...prev,
        authors: prev.authors.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    // ... существующая валидация без изменений
    if (!formData.title.trim()) {
      errors.title = 'Название книги обязательно';
    } else if (formData.title.trim().length > 200) {
      errors.title = 'Название книги не должно превышать 200 символов';
    }

    if (!formData.description.trim()) {
      errors.description = 'Описание обязательно';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Описание должно содержать минимум 10 символов';
    } else if (formData.description.trim().length > 2000) {
      errors.description = 'Описание не должно превышать 1000 символов';
    }

    if (formData.price === '' || formData.price === null || formData.price === undefined) {
      errors.price = 'Цена обязательна';
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price)) {
        errors.price = 'Цена должна быть числом';
      } else if (price < 0) {
        errors.price = 'Цена не может быть отрицательной';
      } else if (price > 1000000) {
        errors.price = 'Цена не может превышать 1 000 000';
      }
    }

    if (formData.authors && formData.authors.length > 0) {
      const authorErrors = [];
      let hasValidAuthor = false;

      formData.authors.forEach((author, index) => {
        if (author.trim()) {
          hasValidAuthor = true;
          if (author.trim().length > 100) {
            authorErrors[index] = 'Имя автора не должно превышать 100 символов';
          }
        }
      });

      if (authorErrors.length > 0) {
        errors.authors = authorErrors;
      }
    }

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        errorElement.focus();
      }
      
      return;
    }

    setFieldErrors({});
    setSaving(true);
    setError('');

    try {
      await bookService.updateBook(id, {
        ...formData,
        authors: formData.authors.filter(a => a.trim() !== '')
      });

      const updated = await bookService.getBookById(id);
      setBook(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setError('Ошибка при сохранении книги');

      if (book) {
        setFormData({
          title: book.title,
          description: book.description,
          authors: book.authors,
          price: book.price
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      title: book.title || '',
      description: book.description || '',
      authors: book.authors?.length ? book.authors : [''],
      price: book.price || 0
    });
    setIsEditing(false);
    setError('');
    setFieldErrors({});
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить книгу?')) return;
    if (!window.confirm('Это действие нельзя отменить. Все связанные отзывы также будут удалены.')) return;

    try {
      await bookService.deleteBook(id);
      navigate('/books');
    } catch (err) {
      console.error('Ошибка при удалении:', err);
      setError('Ошибка при удалении книги');
    }
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection="books" />
        <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="loading">Загрузка книги...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection="books"
      />

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="book-details-page">
          {error && <div className="error-message">{error}</div>}

          {!isEditing ? (
            <>
              <h1>{book?.title}</h1>
              <p className="book-authors-form">{book?.authors?.join(', ') || 'Автор неизвестен'}</p>
              <p className="book-price-detail">{book?.price} ₽</p>

              <div className="book-description-full">
                {book?.description || 'Описание отсутствует'}
              </div>

              <div className="book-actions">
                {/* Новая кнопка добавления в список */}
                {user && (
                  <Button 
                    variant="filled" 
                    onClick={() => setShowAddToListModal(true)}
                    className="add-to-list-btn"
                  >
                    + Добавить в список для чтения
                  </Button>
                )}

                {user?.role === 'Admin' && (
                  <>
                    <Button variant="filled" onClick={() => setIsEditing(true)}>
                      Редактировать
                    </Button>
                    <Button variant="outlined" onClick={handleDelete}>
                      Удалить
                    </Button>
                  </>
                )}

                <Button variant="outlined" onClick={() => navigate('/books')}>
                  ← Назад к книгам
                </Button>
              </div>

              {/* Секция отзывов */}
              <div className="book-section">
                <h2>Отзывы на книгу</h2>

                {!showReviews && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setShowReviews(true);
                      loadReviews();
                    }}
                  >
                    Показать отзывы
                  </Button>
                )}

                {showReviews && (
                  <>
                    {reviewsLoading ? (
                      <p className="reviews-loading">Загрузка отзывов...</p>
                    ) : reviews.length === 0 ? (
                      <p className="no-reviews">Отзывов пока нет</p>
                    ) : (
                      <ul className="review-list">
                        {reviews.map((r) => (
                          <li key={r.id} className="review-item">
                            <div className="review-header">
                              <span className="review-user">{r.userName}</span>
                              <span className="review-rating">{r.rating}⭐</span>
                            </div>
                            <p className="review-text">{r.reviewText.substring(0, 100)}...</p>
                            <div className="review-actions">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => navigate(`/review/${r.id}`)}
                              >
                                Перейти к отзыву →
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button variant="outlined" onClick={() => setShowReviews(false)}>
                      Скрыть отзывы
                    </Button>
                  </>
                )}
              </div>
            </>
          ) : (
            // Форма редактирования (без изменений)
            <div className="book-edit-form">
              {/* ... существующая форма редактирования без изменений ... */}
              <h1>Редактирование книги</h1>

              <div className="book-edit-field">
                <label htmlFor="title">Название книги *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`book-edit-input ${fieldErrors.title ? 'input-error' : ''}`}
                  placeholder="Введите название книги"
                  maxLength={200}
                />
                {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
              </div>

              <div className="book-edit-field">
                <label htmlFor="description">Описание *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`book-edit-textarea ${fieldErrors.description ? 'input-error' : ''}`}
                  placeholder="Введите описание книги"
                  rows="6"
                  maxLength={1000}
                />
                {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
              </div>

              <div className="book-edit-field">
                <label>Авторы</label>
                {formData.authors.map((author, index) => (
                  <div key={index} className="book-author-input-group">
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => handleAuthorChange(index, e.target.value)}
                      className={`book-edit-input ${fieldErrors.authors && fieldErrors.authors[index] ? 'input-error' : ''}`}
                      placeholder="Введите имя автора"
                      maxLength={100}
                    />
                    {formData.authors.length > 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={() => removeAuthorField(index)}
                        className="book-remove-author-btn"
                      >
                        ×
                      </Button>
                    )}
                    {fieldErrors.authors && fieldErrors.authors[index] && (
                      <p className="field-error">{fieldErrors.authors[index]}</p>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outlined" onClick={addAuthorField} size="small">
                  + Добавить автора
                </Button>
              </div>

              <div className="book-edit-field">
                <label htmlFor="price">Цена (₽) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className={`book-edit-input ${fieldErrors.price ? 'input-error' : ''}`}
                  placeholder="0"
                  min="0"
                  max="1000000"
                  step="0.01"
                />
                {fieldErrors.price && <p className="field-error">{fieldErrors.price}</p>}
              </div>

              <div className="book-edit-actions">
                <Button variant="filled" onClick={handleSave} disabled={saving}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Button>
                <Button variant="outlined" onClick={handleCancel} disabled={saving}>
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {/* Модальное окно добавления в список */}
          {showAddToListModal && (
            <div className="modal-overlay-list" onClick={() => setShowAddToListModal(false)}>
              <div className="modal-content-list" onClick={e => e.stopPropagation()}>
                <h2>Добавить в список для чтения</h2>
                <p className="modal-subtitle-list">Выберите список, в который хотите добавить книгу "{book?.title}"</p>

                {listOperationMessage && (
                  <div className={`operation-message ${listOperationMessage.includes('успешно') ? 'success' : 'error'}`}>
                    {listOperationMessage}
                  </div>
                )}

                <div className="form-group-list">
                  <label htmlFor="readingListSelect">Список для чтения *</label>
                  <select
                    id="readingListSelect"
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="form-select"
                    disabled={addingToList}
                  >
                    <option value="">-- Выберите список --</option>
                    {userReadingLists.map(list => (
                      <option key={list.id} value={list.id}>
                        {list.readingListName}
                        
                      </option>
                    ))}
                  </select>
                </div>

                {userReadingLists.length === 0 && (
                  <div className="no-lists-message-list">
                    <p>У вас пока нет списков для чтения</p>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/reading-lists')}
                      size="small"
                    >
                      Создать список
                    </Button>
                  </div>
                )}

                <div className="form-actions-list">
                  <Button 
                    variant="filled" 
                    onClick={handleAddToReadingList}
                    disabled={addingToList || !selectedListId || userReadingLists.length === 0}
                  >
                    {addingToList ? 'Добавление...' : 'Добавить в список'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={() => {
                      setShowAddToListModal(false);
                      setSelectedListId('');
                      setListOperationMessage('');
                    }}
                    disabled={addingToList}
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