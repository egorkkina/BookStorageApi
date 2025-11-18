import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import './HomePage.css';
import { BackgroundPaths } from '../../components/BackgroundPaths/BackgroundPaths';

export default function HomePage() {
  const navigate = useNavigate();
  
  return (
    <div className="home-container">  
      <div className="home-box">
        <div className="home-content">
          <h1>Добро пожаловать! </h1>

          <div className="home-buttons">
            <Button variant="filled" onClick={() => navigate('/register')}>
              Регистрация
            </Button>

            <Button variant="outlined" onClick={() => navigate('/login')}>
              Личный кабинет
            </Button>
          </div>

          <p>
            Присоединяйтесь к нашему сообществу книголюбов.<br />
            Обсуждайте, делитесь и находите новые любимые книги.
          </p>
        </div>
    </div>
        <div className="home-right-container">
          <BackgroundPaths />
        </div>
  </div>
  );
}
