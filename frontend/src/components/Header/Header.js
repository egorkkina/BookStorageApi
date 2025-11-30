import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/books')}>
            <img src="/favicon.ico" alt="BookStorage Icon" className="logo-icon" />
          Букля
        </div>
      </div>
    </header>
  );
}