import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import readingListService from "../../services/readingListService";
import bookService from "../../services/bookService";
import Sidebar from "../../components/Sidebar/Sidebar";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import "./ReadingListFormPage.css";

export default function ReadingListFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState({ 
    readingListName: "",
    readingListDescription: "",
    isPublic: true,
    books: [] 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    readingListName: "",
    readingListDescription: "",
    isPublic: true
  });
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});

  const [selectedBook, setSelectedBook] = useState(null);
  const [addingBook, setAddingBook] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  // Новые состояния для поиска книг по названию
  const [bookSearch, setBookSearch] = useState({
    query: "",
    selectedBook: null,
    selectedBookId: ""
  });
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  // Загрузка данных списка
  useEffect(() => {
    const loadListData = async () => {
      if (!id) return;
      
      setLoading(true);
      setError("");
      
      try {
        const listData = await readingListService.getById(id);
        
        const booksData = await readingListService.getBooks(id);
        
        setList({
          ...listData,
          books: Array.isArray(booksData) ? booksData : []
        });

        // Заполняем форму данными
        setFormData({
          readingListName: listData.readingListName || "",
          readingListDescription: listData.readingListDescription || "Этот список создан для организации вашего чтения.",
          isPublic: listData.isPublic ?? true
        });

        // Проверяем права доступа
        const hasAccess = user?.role === "Admin" || listData.userId === user?.id;
        setCanEdit(hasAccess);

      } catch (err) {
        console.error("Ошибка загрузки списка:", err);
        setError("Не удалось загрузить данные списка");
      } finally {
        setLoading(false);
      }
    };

    loadListData();
  }, [id, user]);

  // Обновление списка книг
  const refreshBooks = async () => {
    try {
      const booksData = await readingListService.getBooks(id);
      setList(prev => ({ 
        ...prev, 
        books: Array.isArray(booksData) ? booksData : [] 
      }));
    } catch (err) {
      console.error("Ошибка обновления книг:", err);
      setError("Ошибка при обновлении списка книг");
    }
  };

  // Поиск книг по названию
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
      );
      
      setBookSearchResults(filteredBooks);
    } catch (err) {
      console.error('Ошибка при поиске книг:', err);
      setBookSearchResults([]);
    } finally {
      setSearchingBooks(false);
    }
  };

  // Обработка изменений в поиске книг
  const handleBookSearchChange = (e) => {
    const query = e.target.value;
    setBookSearch(prev => ({
      ...prev,
      query,
      selectedBook: null,
      selectedBookId: ""
    }));

    searchBooks(query);
  };

  const handleBookSelect = (book) => {
    setBookSearch(prev => ({
      ...prev,
      query: book.title,
      selectedBook: book,
      selectedBookId: book.id
    }));
    setBookSearchResults([]);
  };

  // Валидация формы
  const validateForm = () => {
    const errors = {};

    // Валидация названия
    if (!formData.readingListName.trim()) {
      errors.readingListName = 'Название списка обязательно';
    } else if (formData.readingListName.trim().length < 2) {
      errors.readingListName = 'Название должно содержать минимум 2 символа';
    } else if (formData.readingListName.trim().length > 100) {
      errors.readingListName = 'Название не должно превышать 100 символов';
    }

    // Валидация описания
    if (!formData.readingListDescription.trim()) {
      errors.readingListDescription = 'Описание обязательно';
    } else if (formData.readingListDescription.trim().length < 10) {
      errors.readingListDescription = 'Описание должно содержать минимум 10 символов';
    } else if (formData.readingListDescription.trim().length > 1000) {
      errors.readingListDescription = 'Описание не должно превышать 1000 символов';
    }

    return errors;
  };

  // Валидация выбора книги
  const validateBookSelection = () => {
    if (!bookSearch.selectedBookId) {
      return "Выберите книгу из списка";
    }
    
    // Проверяем, есть ли книга уже в списке
    const isBookInList = list.books.some(book => book.id === bookSearch.selectedBookId);
    if (isBookInList) {
      return "Эта книга уже есть в списке";
    }

    return null;
  };

  // Добавление книги в список
  const handleAddBook = async () => {
    const bookError = validateBookSelection();
    if (bookError) {
      setError(bookError);
      return;
    }

    setAddingBook(true);
    setError("");
    
    try {
      await readingListService.addBook(id, bookSearch.selectedBookId);
      
      await refreshBooks();
      
      setShowAddBookModal(false);
      setBookSearch({
        query: "",
        selectedBook: null,
        selectedBookId: ""
      });
      setBookSearchResults([]);
      
    } catch (err) {
      console.error("Ошибка добавления книги:", err);
      
      if (err.response?.status === 404) {
        setError("Книга не найдена");
      } else if (err.response?.status === 400) {
        setError("Невозможно добавить книгу в список");
      } else if (err.response?.status === 409) {
        setError("Книга уже находится в этом списке");
      } else {
        setError("Ошибка при добавлении книги в список");
      }
    } finally {
      setAddingBook(false);
    }
  };

  // Удаление книги из списка
  const handleRemoveBook = async (bookId) => {
    if (!window.confirm("Вы уверены, что хотите удалить книгу из списка?")) {
      return;
    }
    
    if (!canEdit) {
      setError("У вас нет прав для редактирования этого списка");
      return;
    }

    try {
      // Удаляем книгу через API
      await readingListService.removeBook(id, bookId);
      
      // Немедленно обновляем UI - удаляем книгу из состояния
      setList(prev => ({
        ...prev,
        books: prev.books.filter(book => book.id !== bookId)
      }));
      
      // Закрываем модальное окно, если оно открыто для удаляемой книги
      if (selectedBook && selectedBook.id === bookId) {
        setSelectedBook(null);
      }
      
      setError("");
      
    } catch (err) {
      console.error("Ошибка удаления книги:", err);
      
      if (err.response?.status === 404) {
        setError("Книга не найдена в списке");
      } else if (err.response?.status === 403) {
        setError("Недостаточно прав для удаления книги");
      } else {
        setError("Ошибка при удалении книги из списка");
        
        // При ошибке перезагружаем данные для синхронизации
        await refreshBooks();
      }
    }
  };

  // Удаление всего списка
  const handleDeleteList = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить этот список?")) return;
    if (!window.confirm("Это действие невозможно отменить. Все книги будут удалены из списка.")) return;
    
    if (!canEdit) {
      setError("У вас нет прав для удаления этого списка");
      return;
    }

    try {
      await readingListService.delete(id);
      navigate("/readinglists");
    } catch (err) {
      console.error("Ошибка удаления списка:", err);
      setError("Ошибка при удалении списка");
    }
  };

  // Сохранение изменений списка
  const handleSaveList = async () => {
    if (!canEdit) {
      setError("У вас нет прав для редактирования этого списка");
      return;
    }

    // Валидация формы
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      return;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      // Обновляем список через API
      await readingListService.update(id, {
        readingListName: formData.readingListName.trim(),
        readingListDescription: formData.readingListDescription.trim(),
        isPublic: formData.isPublic
      });

      // Обновляем состояние списка
      setList(prev => ({
        ...prev,
        readingListName: formData.readingListName.trim(),
        readingListDescription: formData.readingListDescription.trim(),
        isPublic: formData.isPublic
      }));

      // Выходим из режима редактирования
      setIsEditing(false);
      
    } catch (err) {
      console.error("Ошибка сохранения списка:", err);
      setError("Ошибка при сохранении изменений списка");
    } finally {
      setSaving(false);
    }
  };

  // Обработчики изменений формы
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setFormData({
      readingListName: list.readingListName || "",
      readingListDescription: list.readingListDescription || "Этот список создан для организации вашего чтения.",
      isPublic: list.isPublic ?? true
    });
    
    setIsEditing(false);
    setFieldErrors({});
    setError("");
  };

  const resetBookSearch = () => {
    setBookSearch({
      query: "",
      selectedBook: null,
      selectedBookId: ""
    });
    setBookSearchResults([]);
    setShowAddBookModal(false);
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          activeSection="readinglists"
          user={user}
        />
        <div className={`profile-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
          <div className="loading">Загрузка списка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeSection="readinglists"
        user={user}
      />

      <div className={`profile-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="reading-list-details-page">
          
          {/* Общее сообщение об ошибке */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!isEditing ? (
            /* Режим просмотра */
            <>
              <h1>{list.readingListName}</h1>
              
              <p className="reading-list-description">
                {list.readingListDescription}
              </p>

              {/* Бейдж видимости */}
              <div className={`visibility-badge ${list.isPublic ? "public" : "private"}`}>
                <span className="visibility-icon">
                  {list.isPublic ? "🌍" : "🔒"}
                </span>
                <span className="visibility-text">
                  {list.isPublic ? "Публичный список" : "Приватный список"}
                </span>
              </div>

              {/* Действия */}
              <div className="actions">
                {canEdit && (
                  <>
                    <Button 
                      variant="filled" 
                      onClick={() => setIsEditing(true)}
                    >
                      Редактировать список
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={handleDeleteList}
                    >
                      Удалить список
                    </Button>
                  </>
                )}
                <Button 
                  variant="outlined" 
                  onClick={() => navigate("/readinglists")}
                >
                  ← Назад к спискам
                </Button>
              </div>

              {/* Секция книг */}
              <div className="books-section">
                <div className="section-header">
                  <h3>Книги в списке ({list.books.length})</h3>
                  
                  {canEdit && (
                    <Button 
                      variant="filled" 
                      onClick={() => setShowAddBookModal(true)}
                      size="small"
                    >
                      + Добавить книгу
                    </Button>
                  )}
                </div>

                {list.books.length > 0 ? (
                  <div className="books-grid">
                    {list.books.map(book => (
                      <div 
                        key={book.id} 
                        className="book-card" 
                        onClick={() => setSelectedBook(book)}
                      >
                        <div className="book-content">
                          <h4 className="book-title">{book.title}</h4>
                          
                          {book.authors && book.authors.length > 0 && (
                            <p className="book-authors">
                              {book.authors.join(', ')}
                            </p>
                          )}
                          
                          {book.description && (
                            <p className="book-description">
                              {book.description.length > 100 
                                ? `${book.description.substring(0, 100)}...` 
                                : book.description
                              }
                            </p>
                          )}
                          
                          <div className="book-price">
                            {book.price} ₽
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>В этом списке пока нет книг</p>
                    {canEdit && (
                      <p className="empty-state-hint">
                        Нажмите "Добавить книгу", чтобы начать
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Режим редактирования */
            <div className="edit-form">
              <h1>Редактирование списка</h1>

              <div className="form-group">
                <label>Название списка *</label>
                <input
                  type="text"
                  name="readingListName"
                  value={formData.readingListName}
                  onChange={handleInputChange}
                  className={fieldErrors.readingListName ? 'input-error' : ''}
                  placeholder="Введите название списка"
                  maxLength={100}
                />
                {fieldErrors.readingListName && (
                  <p className="field-error">{fieldErrors.readingListName}</p>
                )}
                <div className="character-count">
                  {formData.readingListName.length}/100
                </div>
              </div>

              <div className="form-group">
                <label>Описание *</label>
                <textarea
                  name="readingListDescription"
                  value={formData.readingListDescription}
                  onChange={handleInputChange}
                  className={fieldErrors.readingListDescription ? 'input-error' : ''}
                  placeholder="Опишите назначение этого списка..."
                  rows="4"
                  maxLength={1000}
                />
                {fieldErrors.readingListDescription && (
                  <p className="field-error">{fieldErrors.readingListDescription}</p>
                )}
                <div className="character-count">
                  {formData.readingListDescription.length}/1000
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                  />
                  Публичный список
                </label>
                <p className="checkbox-hint">
                  {formData.isPublic 
                    ? "Список будет виден другим пользователям" 
                    : "Список будет доступен только вам"
                  }
                </p>
              </div>

              {/* Общие ошибки формы */}
              {Object.keys(fieldErrors).length > 0 && (
                <div className="form-errors">
                  <h4>Необходимо исправить следующие ошибки:</h4>
                  <ul>
                    {fieldErrors.readingListName && (
                      <li>Название списка: {fieldErrors.readingListName}</li>
                    )}
                    {fieldErrors.readingListDescription && (
                      <li>Описание: {fieldErrors.readingListDescription}</li>
                    )}
                  </ul>
                </div>
              )}

              <div className="form-actions">
                <Button 
                  variant="filled" 
                  onClick={handleSaveList} 
                  disabled={saving}
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {/* Модальное окно добавления книги */}
          {showAddBookModal && (
            <div className="modal-overlay" onClick={resetBookSearch}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Добавить книгу в список</h2>

                <div className="form-group">
                  <label htmlFor="bookSearch">Поиск книги *</label>
                  <input
                    id="bookSearch"
                    className="form-input"
                    value={bookSearch.query}
                    onChange={handleBookSearchChange}
                    placeholder="Начните вводить название книги..."
                    disabled={addingBook}
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
                          <span className="book-price">{book.price} ₽</span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchingBooks && (
                    <div className="search-loading">Поиск книг...</div>
                  )}
                  
                  {bookSearch.selectedBookId && (
                    <div className="selected-book">
                      Выбрана: <strong>{bookSearch.query}</strong>
                    </div>
                  )}
                </div>

                <div className="form-actions">
                  <Button 
                    variant="filled" 
                    onClick={handleAddBook}
                    disabled={addingBook || !bookSearch.selectedBookId}
                  >
                    {addingBook ? 'Добавление...' : 'Добавить книгу'}
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={resetBookSearch}
                    disabled={addingBook}
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Модальное окно просмотра книги */}
          {selectedBook && (
            <div 
              className="modal-overlay" 
              onClick={() => setSelectedBook(null)}
            >
              <div 
                className="modal-content" 
                onClick={e => e.stopPropagation()}
              >
                <h2>{selectedBook.title}</h2>
                
                {selectedBook.authors && selectedBook.authors.length > 0 && (
                  <p><strong>Автор(ы):</strong> {selectedBook.authors.join(", ")}</p>
                )}
                
                <p><strong>Цена:</strong> {selectedBook.price} ₽</p>
                
                {selectedBook.description && (
                  <p className="book-description-full">
                    {selectedBook.description}
                  </p>
                )}

                <div className="modal-actions">
                  {canEdit && (
                    <Button 
                      variant="outlined" 
                      onClick={() => handleRemoveBook(selectedBook.id)}
                    >
                      Удалить из списка
                    </Button>
                  )}
                  <Button 
                    variant="filled" 
                    onClick={() => setSelectedBook(null)}
                  >
                    Закрыть
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