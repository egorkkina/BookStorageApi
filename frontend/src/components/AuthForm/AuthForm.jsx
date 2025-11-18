import Button from '../Button/Button';
import { Link } from 'react-router-dom';

export default function AuthForm({ title, subtitle, formFields, handleSubmit, handleChange, formData, loading, error, submitText, extraLink }) {
  return (
    <div className="login-container">
      <div className="login-background"></div>
      <div className="login-box">
        <div className="login-content">
          <div className="login-header">
            <h1>{title}</h1>
            <p className="login-subtitle">{subtitle}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {formFields.map(({ name, type, placeholder, label, minLength }) => (
              <div key={name} className="form-group">
                <label htmlFor={name}>{label}</label>
                <input
                  type={type}
                  id={name}
                  name={name}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  minLength={minLength}
                  required
                  className="form-input"
                />
              </div>
            ))}

            <Button
              type="submit"
              variant="filled"
              fullWidth
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : submitText}
            </Button>
          </form>

          <div className="divider"></div>

          {extraLink}

            <div className="login-links">
              <Link to="/" className="back-link">
                <span className="arrow">←</span> Назад
              </Link>
            </div>
          
        </div>
      </div>
    </div>
  );
}
