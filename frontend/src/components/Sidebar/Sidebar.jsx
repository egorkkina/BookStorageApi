import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAvatar } from '../../hooks/useAvatar';
import './Sidebar.css';

function Sidebar({ isOpen, onToggle, activeSection, onSectionChange }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ← user и logout из контекста

  const { avatar, avatarError, handleAvatarUpload, handleRemoveAvatar } = useAvatar();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDefaultAvatar = (username) => (
    <div className="default-avatar">{username ? username.charAt(0).toUpperCase() : 'U'}</div>
  );

  const handleNavigation = (section) => {
    if (onSectionChange) onSectionChange(section);
    else {
      switch (section) {
        case 'profile': navigate('/profile'); break;
        case 'books': navigate('/books'); break;
        case 'readinglists': navigate('/readinglists'); break;
        case 'reviews': navigate('/reviews'); break;
        default: navigate('/profile');
      }
    }
  };

  return (
    <div className="sidebar-container">
      <button className={`sidebar-toggle ${isOpen ? 'open' : 'closed'}`} onClick={onToggle}>
        {isOpen ? '◀' : '▶'}
      </button>

      <div className={`profile-sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="profile-header">
          <div className="avatar-section">
            {avatar ? (
              <img src={avatar} alt="Avatar" className="avatar-preview" />
            ) : (
              getDefaultAvatar(user?.username)
            )}
            <div className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="avatar-upload-btn">
                {avatar ? 'Изменить фото' : 'Загрузить фото'}
              </label>
              {avatar && (
                <button className="avatar-remove-btn" onClick={handleRemoveAvatar}>
                  Удалить
                </button>
              )}
            </div>
            {avatarError && <div className="avatar-error">{avatarError}</div>}
          </div>

          <div className="user-info">
            <h1>{user?.username}</h1>
            <p>{user?.email}</p>
          </div>
        </div>

        <nav className="profile-nav">
          <div className="nav-section">
            <h3>Навигация</h3>
            {['profile', 'books', 'readinglists', 'reviews'].map((section) => (
              <div
                key={section}
                className={`nav-item ${activeSection === section ? 'active' : ''}`}
                onClick={() => handleNavigation(section)}
              >
                <span className="nav-icon"></span>
                {section === 'profile'
                  ? 'Профиль'
                  : section === 'books'
                  ? 'Книги'
                  : section === 'readinglists'
                  ? 'Мои листы для чтения'
                  : 'Отзывы на книги'}
              </div>
            ))}
          </div>

          <div className="nav-section">
            <h3>Действия</h3>
            <div className="nav-item" onClick={handleLogout}>
              <span className="nav-icon"></span> Выйти
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Sidebar;