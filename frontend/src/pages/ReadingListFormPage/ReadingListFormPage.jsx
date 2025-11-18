import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import readingListService from "../../services/readingListService";
import Sidebar from "../../components/Sidebar/Sidebar";
import Button from "../../components/Button/Button";
import { useAuth } from "../../context/AuthContext";
import "./ReadingListFormPage.css";

export default function ReadingListFormPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList] = useState({ books: [] });
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

  // Модальное окно для книги
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Добавление книги в список
  const [newBookId, setNewBookId] = useState("");
  const [addingBook, setAddingBook] = useState(false);

  // Проверка прав доступа
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await readingListService.getById(id);
        const books = await readingListService.getBooks(id);

        setList({
          ...data,
          books: Array.isArray(books) ? books : []
        });

        setFormData({
          readingListName: data.readingListName || "",
          readingListDescription: data.readingListDescription || "Этот список создан для организации вашего чтения. Добавляйте книги, которые планируете прочитать или хотите рекомендовать другим.",
          isPublic: data.isPublic ?? true
        });

        // Проверяем права доступа
        const hasAccess = user?.role === "Admin" || data.userId === user?.id;
        setCanEdit(hasAccess);

      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке списка");
      } finally {
        setLoading(false);
      }
    };

    loadList();
  }, [id, user]);

  const refreshBooks = async () => {
    try {
      const books = await readingListService.getBooks(id);
      setList(prev => ({ ...prev, books: Array.isArray(books) ? books : [] }));
    } catch (err) {
      console.error(err);
    }
  };

  // Валидация формы
  const validateForm = () => {
    const errors = {};

    // Валидация названия списка
    if (!formData.readingListName.trim()) {
      errors.readingListName = 'Название списка обязательно';
    } else if (formData.readingListName.trim().length < 2) {
      errors.readingListName = 'Название списка должно содержать минимум 2 символа';
    } else if (formData.readingListName.trim().length > 100) {
      errors.readingListName = 'Название списка не должно превышать 100 символов';
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

  // Валидация добавления книги
  const validateBookId = () => {
    if (!newBookId.trim()) {
      return "Введите ID книги";
    }
    
    // Проверяем, что ID состоит только из цифр и букв (предполагая UUID или числовой ID)
    if (!/^[a-zA-Z0-9-]+$/.test(newBookId.trim())) {
      return "ID книги должен содержать только буквы, цифры и дефисы";
    }
    
    // Проверяем, что книга уже не в списке
    if (list.books.some(book => book.id === newBookId.trim())) {
      return "Эта книга уже есть в списке";
    }

    return null;
  };

  // Добавление книги в список
  const handleAddBook = async () => {
    const bookError = validateBookId();
    if (bookError) {
      setError(bookError);
      return;
    }

    if (!canEdit) {
      setError("У вас нет прав для редактирования этого списка");
      return;
    }

    setAddingBook(true);
    setError("");
    try {
      await readingListService.addBook(id, newBookId.trim());
      await refreshBooks();
      setNewBookId("");
    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        setError("Книга не найдена");
      } else if (err.response?.status === 400) {
        setError("Книга уже в списке или недоступна");
      } else {
        setError("Ошибка при добавлении книги");
      }
    } finally {
      setAddingBook(false);
    }
  };

  const handleRemoveBook = async (bookId) => {
    if (!window.confirm("Удалить книгу из списка?")) return;
    
    if (!canEdit) {
      setError("У вас нет прав для редактирования этого списка");
      return;
    }

    try {
      await readingListService.removeBook(id, bookId);
      setSelectedBook(null);
      await refreshBooks();
      setError("");
    } catch (err) {
      console.error(err);
      setError("Ошибка при удалении книги");
    }
  };

  const handleDeleteList = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить список?")) return;
    if (!window.confirm("Это действие нельзя отменить. Все книги будут удалены из списка.")) return;
    
    if (!canEdit) {
      setError("У вас нет прав для удаления этого списка");
      return;
    }

    try {
      await readingListService.delete(id);
      navigate("/readinglists");
    } catch (err) {
      console.error(err);
      setError("Ошибка при удалении списка");
    }
  };

  const handleSaveList = async () => {
    if (!canEdit) {
      setError("У вас нет прав для редактирования этого списка");
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }

    setSaving(true);
    setError("");
    setFieldErrors({});

    try {
      await readingListService.update(id, {
        readingListName: formData.readingListName.trim(),
        readingListDescription: formData.readingListDescription.trim(),
        isPublic: formData.isPublic,
        bookIds: list.books.map(b => b.id)
      });
      setList(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("Ошибка при сохранении списка");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Очищаем ошибку при изменении поля
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCancelEdit = () => {
    // Восстанавливаем исходные данные
    setFormData({
      readingListName: list.readingListName || "",
      readingListDescription: list.readingListDescription || "Этот список создан для организации вашего чтения. Добавляйте книги, которые планируете прочитать или хотите рекомендовать другим.",
      isPublic: list.isPublic ?? true
    });
    setIsEditing(false);
    setFieldErrors({});
    setError("");
  };

  if (loading) return <p>Загрузка списка...</p>;

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
          {error && <div className="error-message">{error}</div>}

          {!isEditing ? (
            <>
              <h1>{list.readingListName}</h1>
              <p className="reading-list-description">
                {list.readingListDescription || "Этот список создан для организации вашего чтения. Добавляйте книги, которые планируете прочитать или хотите рекомендовать другим."}
              </p>

              <div className={`visibility-badge ${list.isPublic ? "public" : "private"}`}>
                <span className="visibility-icon">{list.isPublic ? "🌍" : "🔒"}</span>
                <span className="visibility-text">{list.isPublic ? "Публичный список" : "Приватный список"}</span>
              </div>

              <div className="actions">
                {canEdit && (
                  <>
                    <Button variant="filled" onClick={() => setIsEditing(true)}>
                      Редактировать список
                    </Button>
                    <Button variant="outlined" onClick={handleDeleteList}>
                      Удалить список
                    </Button>
                  </>
                )}
                <Button variant="outlined" onClick={() => navigate("/readinglists")}>
                  ← Назад к спискам
                </Button>
              </div>

              <div className="books-section">
                <div className="section-header">
                  <h3>Книги в списке ({list.books.length})</h3>
                  
                  {canEdit && (
                    <div className="add-book-form">
                      <div className="form-group">
                        <input
                          type="text"
                          placeholder="Введите ID книги..."
                          value={newBookId}
                          onChange={(e) => setNewBookId(e.target.value)}
                          className="book-id-input"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddBook()}
                        />
                        <Button 
                          variant="filled" 
                          onClick={handleAddBook}
                          disabled={addingBook || !newBookId.trim()}
                          size="small"
                        >
                          {addingBook ? "Добавление..." : "Добавить книгу"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {list.books.length > 0 ? (
                  <div className="books-grid">
                    {list.books.map(book => (
                      <div key={book.id} className="book-card" onClick={() => setSelectedBook(book)}>
                        <div className="book-content">
                          <h4 className="book-title">{book.title}</h4>
                          {book.authors && book.authors.length > 0 && (
                            <p className="book-authors">{book.authors.join(', ')}</p>
                          )}
                          {book.description && (
                            <p className="book-description">
                              {book.description.length > 100 
                                ? `${book.description.substring(0, 100)}...` 
                                : book.description
                              }
                            </p>
                          )}
                          <div className="book-price">{book.price} ₽</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>В этом списке пока нет книг</p>
                    {canEdit && (
                      <p className="empty-state-hint">
                        Добавьте книги с помощью формы выше
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
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

              {/* Блок с общими ошибками формы */}
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
                <Button variant="filled" onClick={handleSaveList} disabled={saving}>
                  {saving ? "Сохранение..." : "Сохранить"}
                </Button>
                <Button variant="outlined" onClick={handleCancelEdit}>
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {selectedBook && (
            <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>{selectedBook.title}</h2>
                <p><strong>Автор(ы):</strong> {selectedBook.authors?.join(", ")}</p>
                <p><strong>Цена:</strong> {selectedBook.price} ₽</p>
                <p className="book-description-full">{selectedBook.description}</p>

                <div className="modal-actions">
                  {canEdit && (
                    <Button variant="outlined" onClick={() => handleRemoveBook(selectedBook.id)}>
                      Удалить из списка
                    </Button>
                  )}
                  <Button variant="filled" onClick={() => setSelectedBook(null)}>
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