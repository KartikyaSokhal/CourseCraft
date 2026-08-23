// src/pages/HomePage/Hero.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          
          {/* Left Column: Editorial Headline & CTAs */}
          <div className="hero-content">
            <div className="powered-by">
              <span>✨</span> AI-POWERED LEARNING STUDIO
            </div>
            
            <h1 className="hero-title">
              Transform Any Subject into an <span className="highlight">Interactive AI Course</span>
            </h1>
            
            <p className="hero-subtitle">
              CourseCraft turns topic prompts into structured curricula with curated lessons, server-graded quizzes, and voice-assisted Feynman active recall.
            </p>
            
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary">
                Create account &rarr;
              </Link>
              <HashLink to="/#how-it-works" className="btn btn-secondary">
                See how it works &darr;
              </HashLink>
            </div>
          </div>

          {/* Right Column: Studio-Preview Card (recreating Course Player reference layout) */}
          <div className="hero-preview">
            <div className="hero-preview-card">
              
              {/* Top Bar / Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#EEF2FF', color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                    <i className="fas fa-project-diagram"></i>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>Data Structures</h3>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Course progress</div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--teal-accent)' }}>65%</div>
                  <div style={{ width: '80px', height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden', marginTop: '4px' }}>
                    <div style={{ width: '65%', height: '100%', background: 'var(--teal-accent)', borderRadius: '999px' }}></div>
                  </div>
                </div>
              </div>

              {/* Course Modules List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                
                {/* Module 1: Foundations (Completed) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.75rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                      <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i>
                      <span>Module 1: Foundations</span>
                    </div>
                    <i className="fas fa-chevron-up" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}></i>
                  </div>
                  
                  {/* Active Lesson Item */}
                  <div style={{ marginTop: '0.5rem', padding: '0.45rem 0.75rem', background: '#EEF2FF', borderRadius: '8px', color: '#6366F1', fontWeight: '600', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-play-circle" style={{ fontSize: '0.85rem' }}></i>
                    <span>1.3 Binary Trees (Intro)</span>
                  </div>
                </div>

                {/* Module 2: Linear Structures (In Progress) */}
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid var(--teal-accent)' }}></div>
                    <span>Module 2: Linear Structures</span>
                  </div>
                  <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}></i>
                </div>

                {/* Module 3: Advanced Structures (Locked) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: 0.75 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <i className="fas fa-lock" style={{ fontSize: '0.85rem' }}></i>
                    <span>Module 3: Advanced Structures</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked</span>
                </div>

                {/* Feynman Active Recall Card Preview */}
                <div style={{ marginTop: '0.5rem', padding: '0.85rem 1rem', background: '#FAF8F5', borderRadius: '12px', border: '1px solid #EAE6DF' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                    <i className="fas fa-lightbulb" style={{ color: '#6366F1' }}></i>
                    <span>Explain it in your own words</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                    Type or speak your explanation. AI evaluates your understanding.
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="text" readOnly value="A binary tree has at most two children..." style={{ flex: 1, padding: '0.35rem 0.6rem', fontSize: '0.78rem', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF' }} />
                    <button type="button" className="btn btn-primary" style={{ padding: '0.35rem 0.85rem', fontSize: '0.78rem', borderRadius: '6px' }}>Explain</button>
                  </div>
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