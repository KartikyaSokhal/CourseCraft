// src/pages/SignupPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import AuthModal from '../components/auth/AuthModal';

function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      await registerUser(username, email, password);
      setMessage({ text: 'Registration successful! Redirecting to login...', type: 'success' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (err) {
      setMessage({ text: err.message || 'Registration failed.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <AuthModal
      title="Create your account"
      footerText="Already have an account?"
      footerLink="/login"
      footerLinkText="Sign in"
    >
      {message.text && (
        <p style={{ color: message.type === 'success' ? '#10B981' : '#EF4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {message.text}
        </p>
      )}
      
      <form id="signup-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Name</label>
          <div className="input-wrapper">
            <i className="fas fa-user input-icon-left"></i>
            <input
              type="text"
              id="username"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <i className="fas fa-envelope input-icon-left"></i>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="input-wrapper">
            <i className="fas fa-lock input-icon-left"></i>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i
              className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} input-icon-right`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading || message.type === 'success'}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </AuthModal>
  );
}

export default SignupPage;