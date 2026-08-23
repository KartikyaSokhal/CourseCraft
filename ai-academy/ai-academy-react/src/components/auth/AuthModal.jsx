// src/components/auth/AuthModal.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './AuthModal.css';

function AuthModal({ title, children, footerText, footerLink, footerLinkText }) {
  return (
    <div className="auth-page-container">
      {/* Top Logo matching Reference Photo 2 */}
      <Link to="/" className="auth-brand-logo">
        <div className="logo-box">
          <i className="fas fa-sparkles"></i>
        </div>
        <span>CourseCraft</span>
      </Link>

      <div className="modal-content">
        <h2>{title}</h2>
        {children}
        <div className="switch-modal">
          {footerText} <Link to={footerLink}>{footerLinkText}</Link>
        </div>
      </div>

      {/* Decorative stacked books graphic element matching Reference Photo 2 */}
      <div className="stacked-books-graphic">
        <div className="stacked-book-item" style={{ width: '100px', background: '#A78BFA' }}></div>
        <div className="stacked-book-item" style={{ width: '110px', background: '#C084FC' }}></div>
        <div className="stacked-book-item" style={{ width: '120px', background: '#60A5FA' }}></div>
      </div>
    </div>
  );
}

export default AuthModal;