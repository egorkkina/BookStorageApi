import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginRequest } from '../../services/authService';
import { useAuthForm } from '../../hooks/useAuthForm';
import AuthForm from '../../components/AuthForm/AuthForm';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { formData, loading, error, handleChange, handleSubmit } = useAuthForm(
    { email: '', password: '' },
    async (data) => {
      const res = await loginRequest(data.email, data.password);
      login({ token: res.token });
      navigate('/profile');
    }
  );

  return (
    <AuthForm
      title="Вход"
      subtitle="С возвращением!"
      formData={formData}
      loading={loading}
      error={error}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      submitText="Войти"
      formFields={[
        { name: 'email', type: 'email', label: 'Email', placeholder: 'your@email.com' },
        { name: 'password', type: 'password', label: 'Пароль', placeholder: 'Введите пароль' },
      ]}
      extraLink={
        <p>
          <span className="qwestion">Ещё нет аккаунта?</span> <Link to="/register" className="link-button">Создать аккаунт</Link>
        </p>
      }
    />
  );
}
