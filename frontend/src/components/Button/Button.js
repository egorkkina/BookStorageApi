import React from 'react';
import './Button.css';

export default function Button({ children, onClick, variant = 'filled' }) {
  return (
    <button className={`custom-button ${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
