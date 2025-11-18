import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import readingListService from "../../services/readingListService";
import Button from "../../components/Button/Button";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext"; 
import "./ReadingListsPage.css";

export default function ReadingListsPage() {
  const { user, isAuth } = useAuth(); 
  const [myLists, setMyLists] = useState([]);
  const [publicLists, setPublicLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [booksCounts, setBooksCounts] = useState({}); // Храним количество книг по ID списка

  const [isCreating, setIsCreating] = useState(false);
  const [newListData, setNewListData] = useState({
    readingListName: "",
    readingListDescription: "",
    isPublic: true,
    bookIds: []
  });
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState("my"); // "my" или "public"

  const navigate = useNavigate();

  // Функция для загрузки количества книг для списка
  const loadBookCount = async (listId) => {
    try {
      const count = await readingListService.getCount(listId);
      return count;
    } catch (err) {
      console.error(`Ошибка при загрузке количества книг для списка ${listId}:`, err);
      return 0;
    }
  };

  // Функция для загрузки количества книг для всех списков
  const loadAllBooksCounts = async (lists) => {
    const counts = {};
    
    for (const list of lists) {
      const count = await loadBookCount(list.id);
      counts[list.id] = count;
    }
    
    setBooksCounts(prev => ({ ...prev, ...counts }));
  };

  useEffect(() => {
    if (!isAuth || !user?.id) {
      setError("Пользователь не авторизован");
      setLoading(false);
      return;
    }

    const loadLists = async () => {
      try {
        // Загружаем личные списки пользователя
        const myListsData = await readingListService.getByUser(user.id);
        setMyLists(myListsData);
        await loadAllBooksCounts(myListsData);

        // Загружаем публичные списки всех пользователей
        const allPublicLists = await readingListService.getAllPublicLists();
        
        // Фильтруем, оставляя только списки других пользователей
        const otherUsersPublicLists = allPublicLists.filter(
          list => list.userId !== user.id
        );
        setPublicLists(otherUsersPublicLists);
        await loadAllBooksCounts(otherUsersPublicLists);
      } catch (err) {
        console.error(err);
        setError("Ошибка при загрузке списков");
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, [user, isAuth]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewListData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleCreate = async () => {
    if (!newListData.readingListName.trim()) {
      setError("Название списка не может быть пустым");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const createRequest = {
        userId: user.id,
        readingListName: newListData.readingListName,
        readingListDescription: newListData.readingListDescription,
        isPublic: newListData.isPublic,
        bookIds: newListData.bookIds
      };

      const newListId = await readingListService.create(createRequest);
      
      // Создаем объект нового списка
      const newList = {
        id: newListId.id || newListId,
        readingListName: newListData.readingListName,
        readingListDescription: newListData.readingListDescription,
        isPublic: newListData.isPublic,
        userId: user.id
      };
      
      // Добавляем новый список в мои списки
      setMyLists(prev => [...prev, newList]);
      
      // Устанавливаем количество книг для нового списка (0, так как он только создан)
      setBooksCounts(prev => ({
        ...prev,
        [newList.id]: 0
      }));
      
      // Если список публичный, добавляем его и в публичные списки
      if (newListData.isPublic) {
        setPublicLists(prev => [...prev, newList]);
      }
      
      // Сбрасываем форму
      setNewListData({
        readingListName: "",
        readingListDescription: "",
        isPublic: true,
        bookIds: []
      });
      setIsCreating(false);
    } catch (err) {
      console.error(err);
      setError("Ошибка при создании списка");
    } finally {
      setSaving(false);
    }
  };

  // Функция для получения количества книг для конкретного списка
  const getBookCount = (listId) => {
    return booksCounts[listId] || 0;
  };

  if (!isAuth) return <p>Вы не авторизованы</p>;
  if (loading) return <p>Загрузка списков...</p>;

  return (
    <div className="profile-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeSection="readinglists"
        user={user}
      />

      <div className={`profile-content ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="reading-lists-page">
          <div className="page-header">
            <h1>
              {activeTab === "my" ? "Мои списки" : "Публичные списки других пользователей"}
            </h1>
            {activeTab === "my" && (
              <Button variant="filled" onClick={() => setIsCreating(prev => !prev)}>
                {isCreating ? "Отмена" : "+ Новый список"}
              </Button>
            )}
          </div>

          {/* Переключение вкладок */}
          <div className="tabs-container">
            <div className="tabs">
              <button 
                className={`tab ${activeTab === "my" ? "active" : ""}`}
                onClick={() => setActiveTab("my")}
              >
                Мои списки ({myLists.length})
              </button>
              <button 
                className={`tab ${activeTab === "public" ? "active" : ""}`}
                onClick={() => setActiveTab("public")}
              >
                Списки других пользователей ({publicLists.length})
              </button>
            </div>
          </div>

          {/* Форма создания нового списка (только в моих списках) */}
          {isCreating && activeTab === "my" && (
            <div className="book-edit-form">
              <h1>Новый список</h1>
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label>Название *</label>
                <input
                  className="form-input"
                  type="text"
                  name="readingListName"
                  value={newListData.readingListName}
                  onChange={handleInputChange}
                  placeholder="Введите название списка..."
                />
              </div>

              <div className="form-group">
                <label>Описание *</label>
                <textarea
                  className="form-textarea"
                  name="readingListDescription"
                  value={newListData.readingListDescription}
                  onChange={handleInputChange}
                  placeholder="Опишите назначение этого списка..."
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={newListData.isPublic}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Публичный список
                </label>
                <p className="checkbox-hint">
                  Публичные списки видны другим пользователям
                </p>
              </div>

              <div className="form-actions">
                <Button variant="filled" onClick={handleCreate} disabled={saving}>
                  {saving ? "Сохранение..." : "Создать список"}
                </Button>
                <Button variant="outlined" onClick={() => setIsCreating(false)}>
                  Отмена
                </Button>
              </div>
            </div>
          )}

          {error && !isCreating && <div className="error-message">{error}</div>}

          {/* Отображение списков в зависимости от активной вкладки */}
          <div className="lists-section">
            {activeTab === "my" ? (
              <div className="lists-grid">
                {myLists.length === 0 ? (
                  <div className="empty-state">
                    <p>У вас пока нет списков для чтения</p>
                    <p className="empty-state-hint">
                      Создайте свой первый список, чтобы организовать книги для чтения
                    </p>
                  </div>
                ) : (
                  myLists.map(list => (
                    <div
                      key={list.id}
                      className="reading-list-card"
                      onClick={() => navigate(`/readinglists/${list.id}`)}
                    >
                      <div className="card-header">
                        <h3>{list.readingListName}</h3>
                        <span className={`list-visibility ${list.isPublic ? "public" : "private"}`}>
                          {list.isPublic ? "🌍 Публичный" : "🔒 Приватный"}
                        </span>
                      </div>
                      <p className="list-description">
                        {list.readingListDescription || "Без описания"}
                      </p>
                      <div className="card-footer">
                        <span className="book-count">
                          📚 {getBookCount(list.id)} книг
                        </span>
                        <span className="card-owner">Ваш список</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="lists-grid">
                {publicLists.length === 0 ? (
                  <div className="empty-state">
                    <p>Пока нет публичных списков от других пользователей</p>
                    <p className="empty-state-hint">
                      Пользователи еще не создали публичные списки или поделились ими
                    </p>
                  </div>
                ) : (
                  publicLists.map(list => (
                    <div
                      key={list.id}
                      className="reading-list-card public-card"
                      onClick={() => navigate(`/readinglists/${list.id}`)}
                    >
                      <div className="card-header">
                        <h3>{list.readingListName}</h3>
                        <span className="list-visibility public">
                          🌍 Публичный список
                        </span>
                      </div>
                      <p className="list-description">
                        {list.readingListDescription || "Без описания"}
                      </p>
                      <div className="card-footer">
                        <span className="book-count">
                          📚 {getBookCount(list.id)} книг
                        </span>
                        <span className="card-owner">
                          Список пользователя
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}