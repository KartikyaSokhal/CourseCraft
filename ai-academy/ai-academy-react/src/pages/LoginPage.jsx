// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { loginUser } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import AuthModal from '../components/auth/AuthModal';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      const data = await loginUser(username, password);
      login(data.access); 
      
      localStorage.setItem('access_token', data.access);
      if (data.refresh) {
        localStorage.setItem('refresh_token', data.refresh);
      }
      
      const payload = jwtDecode(data.access);
      const redirectPath = from || (payload.role === 'ADMIN' ? '/admin-dashboard' : '/student-dashboard');
      
      navigate(redirectPath, { replace: true });

    } catch (err) {
      setError(err.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal
      title="Welcome back"
      footerText="Don’t have an account?"
      footerLink="/signup"
      footerLinkText="Create account"
    >
      {error && <p style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
      
      <form id="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">Email or Username</label>
          <div className="input-wrapper">
            <i className="fas fa-envelope input-icon-left"></i>
            <input
              type="text"
              id="username"
              placeholder="Enter your email or username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
              placeholder="Enter your password"
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

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthModal>
  );
}

export default LoginPage;