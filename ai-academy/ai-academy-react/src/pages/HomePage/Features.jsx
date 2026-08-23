// src/pages/HomePage/Features.jsx
import React from 'react';

function Features() {
  return (
    <section className="features-section" id="features-section">
      <div className="container">
        <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>How CourseCraft Works</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            A structured workflow engineered for fast course creation and effective, verifiable learning.
          </p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>1. Author Prompt & Topic</h3>
            <p>Admin authors define a topic or subject prompt. The AI pipeline outlines content modules and assessments automatically.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>2. AI Curriculum Build</h3>
            <p>Deep lesson content, curated video demonstrations, and server-graded quizzes are generated with structured quality checks.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>3. Master & Progress</h3>
            <p>Students study lessons, submit quizzes, and complete Feynman technique challenges to unlock subsequent modules.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Features;