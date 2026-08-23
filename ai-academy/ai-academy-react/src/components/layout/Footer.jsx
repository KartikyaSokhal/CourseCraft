// src/components/layout/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer" id="about" style={{ background: '#FFFFFF', borderTop: '1px solid var(--border-color)', padding: '3.5rem 0 2rem', marginTop: '5rem' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <span className="logo-box">🎓</span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>CourseCraft</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              AI-powered curriculum studio generating interactive courses with Google Gemini AI, Feynman technique evaluation, and sequential mastery locking.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <li><Link to="/#features-section" style={{ color: 'var(--text-secondary)' }}>AI Course Studio</Link></li>
              <li><Link to="/student-dashboard?tab=public" style={{ color: 'var(--text-secondary)' }}>Public Catalog</Link></li>
              <li><Link to="/#about" style={{ color: 'var(--text-secondary)' }}>Feynman Learning Engine</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>Architecture</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <li>Backend: Django REST Framework</li>
              <li>Frontend: React + Vite SPA</li>
              <li>AI Engine: Google Gemini API</li>
            </ul>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <p>© {new Date().getFullYear()} CourseCraft Studio. All rights reserved.</p>
          <p>Engineered for mastery-driven learning.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;