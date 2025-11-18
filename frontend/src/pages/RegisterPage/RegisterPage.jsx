import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerRequest } from '../../services/authService';
import { useAuthForm } from '../../hooks/useAuthForm';
import AuthForm from '../../components/AuthForm/AuthForm';
import './RegisterPage.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { formData, loading, error, handleChange, handleSubmit } = useAuthForm(
    { username: '', email: '', password: '', role: 'User' },
    async (data) => {
      const res = await registerRequest(data);
      login({ token: res.token });
      navigate('/profile');
    }
  );

  return (
    <AuthForm
      title="Регистрация"
      subtitle="Создайте новый аккаунт"
      formData={formData}
      loading={loading}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      submitText="Зарегистрироваться"
      formFields={[
        { name: 'username', type: 'text', label: 'Имя пользователя', placeholder: 'Введите ваше имя' },
        { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com' },
        { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Введите пароль', minLength: 6 },
      ]}
      extraLink={
        <p>
          <span className="qwestion">Уже есть аккаунт?</span> <Link to="/login" className="link-button">Войти в аккаунт</Link>
        </p>
      }
    />
  );
}
