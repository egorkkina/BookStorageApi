import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import './ProfilePage.css';

function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeSection, setActiveSection] = useState('profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

  const handleSectionChange = (section) => {
    if (section === 'books') navigate('/books');
    else if (section === 'readinglists') navigate('/readinglists');
    else if (section === 'reviews') navigate('/reviews');
    else setActiveSection(section);
  };

  const handleEditProfile = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    }
  };

  const renderContent = () => (
    <div className="content-grid">
      <div className="content-card">
        
        <div className="info-grid">
          <div className="info-card">
            <h3>Личная информация</h3>
            <p className="card-description">Ваши персональные данные</p>
            
            <div className="info-item user-info-item">
              <label>Имя пользователя</label>
              <span>{user?.username}</span>
            </div>
            
            <div className="info-item user-info-item">
              <label>Email</label>
              <span>{user?.email}</span>
            </div>
            
            <div className="info-item">
              <label>Роль</label>
              <span>{user?.role}</span>
            </div>
            
            <div className="info-item">
              <label>ID пользователя</label>
              <span>{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <Button variant="filled" onClick={handleEditProfile}>
            Редактировать профиль
          </Button>
          <Button variant="outlined" onClick={() => navigate('/books')}>
            Перейти к книгам
          </Button>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="profile-container">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onToggle={toggleSidebar} 
          activeSection="profile" 
          user={user}
        />
        <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="loading-container">
            <div className="loading">Загрузка профиля...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        user={user}
      />
      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-header">
          <h2>Мой профиль</h2>
          <p>Управление вашей учетной записью и настройками</p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default ProfilePage;