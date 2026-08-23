// src/pages/HomePage/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="powered-by">
            <span>✨</span> AI-POWERED COURSE STUDIO
          </div>
          <h1 className="hero-title">
            Transform Ideas into <span className="highlight">Interactive Courses</span>
          </h1>
          <p className="hero-subtitle">
            CourseCraft uses Google Gemini AI to build structured curricula, rich lesson modules, and Feynman technique mastery challenges in seconds.
          </p>
          <div className="hero-actions">
            <Link to="/signup" className="btn btn-primary">
              Start Learning Free &rarr;
            </Link>
            <HashLink to="/#features-section" className="btn btn-secondary">
              Explore Studio &darr;
            </HashLink>
          </div>

          <div className="hero-highlights" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginTop: '3.5rem',
            textAlign: 'left'
          }}>
            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Instant AI Generation</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Generates multi-module lessons, video curators, and assessments automatically.</p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🧠</div>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Feynman Method</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Practice active recall with speech-to-text evaluation powered by Gemini AI.</p>
            </div>

            <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
              <h4 style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.25rem' }}>Sequential Progression</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>Server-enforced module locks ensure mastery before advancing to the next unit.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;