import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import bookService from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import './BooksPage.css';

function BooksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [books, setBooks] = useState([]);
  const [displayedBooks, setDisplayedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('all');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    authors: [''],
    price: 0
  });

  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadAllBooks();
  }, []);

  const loadAllBooks = async () => {
    setLoading(true);
    try {
      const booksData = await bookService.getAllBooks();
      setBooks(booksData);
      setDisplayedBooks(booksData);
    } catch (err) {
      console.error('Error loading books:', err);
      setError('Ошибка при загрузке книг');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByAuthor = async () => {
    if (!searchTerm.trim()) {
      setDisplayedBooks(books);
      setSearchType('all');
      return;
    }

    setSearchLoading(true);
    try {
      const booksByAuthor = await bookService.getBooksByAuthor(searchTerm);
      setDisplayedBooks(booksByAuthor);
      setSearchType('author');
      setError('');
    } catch (err) {
      console.error('Error reading books by author:', err);
      setError('Ошибка при поиске по автору');
      setDisplayedBooks(books);
      setSearchType('all');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearchByAuthor();
  };

  const handleShowAllBooks = () => {
    setSearchTerm('');
    setDisplayedBooks(books);
    setSearchType('all');
  };

  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'price' ? parseFloat(value) || 0 : value 
    }));
    // Очищаем ошибку при изменении поля
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAuthorChange = (index, value) => {
    const updated = [...formData.authors];
    updated[index] = value;
    setFormData(prev => ({ ...prev, authors: updated }));
  };

  const addAuthorField = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, '']
    }));
  };

  const removeAuthorField = (index) => {
    if (formData.authors.length > 1) {
      const filtered = formData.authors.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, authors: filtered }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Проверка обязательных полей
    if (!formData.title.trim()) {
      errors.title = 'Название обязательно';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Описание обязательно';
    }
    
    if (formData.price < 0) {
      errors.price = 'Цена не может быть отрицательной';
    }
    
    if (formData.price === 0 || formData.price === '') {
      errors.price = 'Цена обязательна';
    }

    return errors;
  };

  const handleAddBook = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);
    setFieldErrors({});

    try {
      // Фильтруем пустых авторов перед отправкой
      const bookData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        authors: formData.authors.filter(a => a.trim() !== ''), // Убираем пустых авторов
        price: formData.price
      };

      await bookService.createBook(bookData);

      setShowAddForm(false);
      setFormData({
        title: '',
        description: '',
        authors: [''],
        price: 0
      });
      setError('');

      await loadAllBooks();
    } catch (err) {
      console.error('Error adding book:', err);
      setError('Ошибка при добавлении книги');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setFormData({
      title: '',
      description: '',
      authors: [''],
      price: 0
    });
    setFieldErrors({});
    setError('');
  };

  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape' && showAddForm) handleCancelAdd();
    };
    window.addEventListener('keydown', escHandler);
    return () => window.removeEventListener('keydown', escHandler);
  }, [showAddForm]);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-content">
          <div className="loading">Загрузка книг...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeSection="books"
        user={user}
      />

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="books-page">
          
          {/* ---------- Заголовок ---------- */}
          <div className="page-header">
            <h1>
              {searchType === 'author'
                ? `Книги автора: "${searchTerm}"`
                : 'Все книги'}
            </h1>

            <div className="header-actions">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Введите имя автора..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="search-input"
                />
                <Button
                  variant="filled"
                  onClick={handleSearchByAuthor}
                  disabled={searchLoading}
                  size="small"
                >
                  {searchLoading ? 'Поиск...' : 'Найти по автору'}
                </Button>
              </div>

              {searchType === 'author' && (
                <Button variant="outlined" size="small" onClick={handleShowAllBooks}>
                  Показать все
                </Button>
              )}

              {searchType === 'all' && user?.role === 'Admin' && (
                <Button
                  variant="filled"
                  onClick={() => setShowAddForm(true)}
                  className="add-book-btn"
                >
                  + Добавить книгу
                </Button>
              )}
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* ---------- GRID КНИГ ---------- */}
          <div className="books-grid">
            {displayedBooks.map(book => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => handleBookClick(book.id)}
              >
                <h3 className="book-title">{book.title}</h3>
                {book.description && (
                  <p className="book-description">
                    {book.description.length > 150
                      ? `${book.description.slice(0, 150)}...`
                      : book.description}
                  </p>
                )}
                <p className="book-authors">
                  {book.authors?.join(', ') || 'Автор неизвестен'}
                </p>
                <div className="book-price-section">
                  <span className="book-price">{book.price} ₽</span>
                </div>
              </div>
            ))}
          </div>

          {displayedBooks.length === 0 && (
            <div className="empty-state">
              <h3>Книги не найдены</h3>
              <Button variant="outlined" onClick={handleShowAllBooks}>
                Показать все книги
              </Button>
            </div>
          )}

          {/* ---------- ОБНОВЛЕННАЯ ФОРМА ДОБАВЛЕНИЯ КНИГИ ---------- */}
          {showAddForm && (
            <div className="add-book-modal-overlay">
              <div className="add-book-modal">
                <div className="add-book-modal-header">
                  <h2>Добавить новую книгу</h2>
                  <button
                    className="add-book-modal-close"
                    onClick={handleCancelAdd}
                    disabled={saving}
                  >
                    ×
                  </button>
                </div>

                <div className="add-book-modal-body">
                  <div className="add-book-form-group">
                    <label>Название книги *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Введите название книги..."
                      className={`add-book-input ${fieldErrors.title ? 'add-book-input-error' : ''}`}
                      disabled={saving}
                    />
                    {fieldErrors.title && (
                      <p className="add-book-field-error">{fieldErrors.title}</p>
                    )}
                  </div>

                  <div className="add-book-form-group">
                    <label>Описание книги *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Введите описание книги..."
                      className={`add-book-textarea ${fieldErrors.description ? 'add-book-input-error' : ''}`}
                      rows="4"
                      disabled={saving}
                    />
                    {fieldErrors.description && (
                      <p className="add-book-field-error">{fieldErrors.description}</p>
                    )}
                  </div>

                  <div className="add-book-form-group">
                    <label>Авторы (необязательно)</label>
                    <div className="add-book-authors-section">
                      {formData.authors.map((author, index) => (
                        <div key={index} className="add-book-author-group">
                          <input
                            type="text"
                            value={author}
                            onChange={(e) => handleAuthorChange(index, e.target.value)}
                            placeholder={`Автор ${index + 1}...`}
                            className="add-book-input"
                            disabled={saving}
                          />
                          {formData.authors.length > 1 && (
                            <button
                              type="button"
                              className="add-book-remove-author-btn"
                              onClick={() => removeAuthorField(index)}
                              disabled={saving}
                            >
                              ×
                            </button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outlined"
                        size="small"
                        onClick={addAuthorField}
                        disabled={saving}
                        className="add-book-add-author-btn"
                      >
                        + Добавить автора
                      </Button>
                    </div>
                  </div>

                  <div className="add-book-form-group">
                    <label>Цена (₽) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className={`add-book-input ${fieldErrors.price ? 'add-book-input-error' : ''}`}
                      disabled={saving}
                    />
                    {fieldErrors.price && (
                      <p className="add-book-field-error">{fieldErrors.price}</p>
                    )}
                  </div>
                </div>

                <div className="add-book-modal-footer">
                  <Button 
                    variant="filled" 
                    onClick={handleAddBook} 
                    disabled={saving}
                    className="add-book-submit-btn"
                  >
                    {saving ? (
                      <>
                        <span className="add-book-loading-spinner"></span>
                        Добавление...
                      </>
                    ) : (
                      'Добавить книгу'
                    )}
                  </Button>

                  <Button 
                    variant="outlined" 
                    onClick={handleCancelAdd} 
                    disabled={saving}
                    className="add-book-cancel-btn"
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

export default BooksPage;