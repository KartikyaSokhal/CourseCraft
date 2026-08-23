// src/pages/HomePage/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          
          {/* Left Hero Content */}
          <div className="hero-content">
            <div className="powered-by">
              <span>✨</span> GOOGLE GEMINI AI LEARNING STUDIO
            </div>
            
            <h1 className="hero-title">
              Transform Ideas into <span className="highlight">Interactive Courses</span>
            </h1>
            
            <p className="hero-subtitle">
              CourseCraft generates structured curricula, rich lesson modules, curated video demonstrations, and Feynman technique active-recall evaluations in seconds.
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              marginTop: '2.5rem'
            }}>
              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>⚡</div>
                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>Instant AI Generation</h4>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🧠</div>
                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>Feynman Speech AI</h4>
              </div>

              <div style={{ background: '#FFFFFF', padding: '1rem', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(15,23,42,0.02)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>🔒</div>
                <h4 style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>Sequential Mastery</h4>
              </div>
            </div>
          </div>

          {/* Right Hero Live Interactive Preview */}
          <div className="hero-preview">
            <div className="hero-preview-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EF4444' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F59E0B' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }}></div>
                </div>
                <span className="badge badge-published">LIVE STUDIO DEMO</span>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Distributed Systems & Cloud Architecture
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                Master load balancing, sharding, event-driven streaming, and active recall.
              </p>

              {/* Module 1 - Completed */}
              <div style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i>
                  <span style={{ fontWeight: '600', fontSize: '0.88rem' }}>1. Foundations of Scalability</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--success-color)', fontWeight: '700' }}>100%</span>
              </div>

              {/* Module 2 - Active */}
              <div style={{ padding: '0.85rem 1rem', background: 'var(--primary-light)', borderRadius: '10px', border: '1px solid #C7D2FE', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <i className="fas fa-play-circle" style={{ color: 'var(--primary-color)' }}></i>
                    <span style={{ fontWeight: '700', fontSize: '0.88rem', color: 'var(--primary-color)' }}>2. Sharding & Event Streams</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: '700' }}>In Progress</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: '#E0E7FF', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', background: 'var(--primary-color)', borderRadius: '999px' }}></div>
                </div>
              </div>

              {/* Module 3 - Locked */}
              <div style={{ padding: '0.75rem 1rem', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', opacity: 0.7, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <i className="fas fa-lock" style={{ color: '#94A3B8' }}></i>
                  <span style={{ fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-muted)' }}>3. Resiliency & Case Studies</span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked</span>
              </div>

              {/* Feynman Prompt Preview */}
              <div style={{ marginTop: '1.25rem', padding: '0.85rem', background: '#FFFFFF', borderRadius: '10px', border: '1px dashed #6366F1', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)', flexShrink: 0 }}>
                  <i className="fas fa-microphone"></i>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <strong>Feynman Evaluator:</strong> "Explain CAP theorem in your own words..."
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default Hero;