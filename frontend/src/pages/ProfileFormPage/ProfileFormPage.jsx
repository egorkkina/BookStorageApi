import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Button from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import './ProfileFormPage.css';

export default function ProfileFormPage() {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getMyProfile();

        setFormData({
          username: profile.username,
          email: profile.email,
          role: profile.role,
        });
      } catch (e) {
        console.error(e);
        setError('Ошибка загрузки профиля');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (fieldErrors[name])
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) errors.username = 'Имя обязательно';
    if (!formData.email.trim()) errors.email = 'Email обязателен';
    else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Email должен содержать @ и домен (например: user@example.com)';
    }
  }

    return errors;
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    setSaving(true);

    try {
      await userService.updateProfile(user.id, {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: '',
        role: formData.role,
      });

      updateUser({
        username: formData.username.trim(),
        email: formData.email.trim(),
        role: formData.role
      });

      navigate('/profile');
    } catch (e) {
      console.error(e);
      setError('Ошибка при сохранении данных');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.')) {
      return;
    }

    if (!window.confirm('ВНИМАНИЕ: Все ваши данные, включая списки чтения и отзывы, будут безвозвратно удалены. Продолжить?')) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await userService.deleteUser(user.id);
      
      // Выход из системы после удаления аккаунта
      logout();
      navigate('/login');
      
    } catch (e) {
      console.error(e);
      if (e.response?.status === 403) {
        setError('Недостаточно прав для удаления аккаунта');
      } else if (e.response?.status === 404) {
        setError('Пользователь не найден');
      } else {
        setError('Ошибка при удалении аккаунта');
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection="profile" />
        <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="loading">Загрузка профиля...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} activeSection="profile" />

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="profile-form-page">
          <h1>Редактирование профиля</h1>

          {error && <div className="error-message">{error}</div>}

          <div className="profile-edit-field">
            <label>Имя пользователя *</label>
            <input
              type="text"
              name="username"
              className={`profile-edit-input ${fieldErrors.username ? 'input-error' : ''}`}
              value={formData.username}
              onChange={handleChange}
            />
            {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
          </div>

          <div className="profile-edit-field">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              className={`profile-edit-input ${fieldErrors.email ? 'input-error' : ''}`}
              value={formData.email}
              onChange={handleChange}
            />
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          {/* Role */}
          {user.role === 'Admin' && (
            <div className="profile-edit-field">
              <label>Роль</label>
              <select
                name="role"
                className="profile-edit-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          )}

          <div className="profile-edit-actions">
            <Button variant="filled" onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>

            <Button variant="outlined" onClick={() => navigate('/profile')}>
              Отмена
            </Button>
          </div>

          {/* Секция удаления аккаунта */}
          <div className="account-danger-zone">
            <h3>Опасная зона</h3>
            <div className="danger-zone-content">
              <p>Удаление аккаунта — необратимое действие. Все ваши данные будут безвозвратно удалены.</p>
              <Button 
                variant="danger" 
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Удаление...' : 'Удалить мой аккаунт'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}