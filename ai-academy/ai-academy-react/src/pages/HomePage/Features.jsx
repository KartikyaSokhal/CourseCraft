// src/pages/HomePage/Features.jsx
import React from 'react';

function Features() {
  return (
    <>
      {/* SECTION 3: THREE FEATURE CARDS */}
      <section className="features-section" id="features-section">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge" style={{ background: '#EEF2FF', color: '#6366F1', marginBottom: '0.75rem' }}>
              STUDIO CAPABILITIES
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.5rem 0', color: 'var(--text-primary)' }}>
              Engineered for Real Progression
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
              CourseCraft combines Google Gemini AI authoring with active-recall learning and server-enforced progression.
            </p>
          </div>

          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-magic"></i>
              </div>
              <h3>AI Course Generation</h3>
              <p>
                Author complete multi-module curricula, structured lessons, curated video demonstrations, and server-graded quizzes from a single prompt.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-brain"></i>
              </div>
              <h3>Feynman Mastery Learning</h3>
              <p>
                Practice active recall by explaining core concepts in your own words. Speech-to-text integration evaluates your genuine understanding.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Progress Protection</h3>
              <p>
                Server-enforced sequential locks prevent skipping ahead. Students must pass assessments to unlock subsequent learning modules.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: THREE-STEP "HOW IT WORKS" */}
      <section className="how-it-works-section" id="how-it-works" style={{ padding: '5rem 0', background: '#FFFFFF', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem' }}>
            <span className="badge" style={{ background: '#CCFBF1', color: '#0D9488', marginBottom: '0.75rem' }}>
              SIMPLE WORKFLOW
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.5rem 0', color: 'var(--text-primary)' }}>
              How CourseCraft Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
              From initial topic prompt to verifiable student mastery in three steps.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            
            {/* Step 1 */}
            <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6366F1', opacity: 0.25, marginBottom: '0.5rem' }}>01</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                1. Define Your Subject
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Enter any topic or subject area. Specify module length, lesson depth, and test frequency for your curriculum.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6366F1', opacity: 0.25, marginBottom: '0.5rem' }}>02</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                2. AI Curriculum Build
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Google Gemini AI generates lesson copy, video demonstration embeds, and intermediate multiple-choice assessments.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'var(--bg-primary)', padding: '2rem', borderRadius: '20px', border: '1px solid var(--border-color)', position: 'relative' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#6366F1', opacity: 0.25, marginBottom: '0.5rem' }}>03</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                3. Learn, Test & Unlock
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Students complete modules, submit voice/text explanations, and pass quizzes to unlock subsequent modules.
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}

export default Features;