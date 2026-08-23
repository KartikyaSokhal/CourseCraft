// src/components/layout/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="footer" id="about" style={{ background: '#FFFFFF', borderTop: '1px solid var(--border-color)', padding: '2rem 0' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="logo-box" style={{ width: '28px', height: '28px', fontSize: '0.9rem' }}>✨</div>
          <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>CourseCraft</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          © {new Date().getFullYear()} CourseCraft Studio. Engineered for mastery-driven learning.
        </p>
      </div>
    </footer>
  );
}

export default Footer;