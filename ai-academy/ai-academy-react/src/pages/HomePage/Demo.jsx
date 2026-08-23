// src/pages/HomePage/Demo.jsx
import React, { useState } from 'react';

function Demo() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillLevel, setSkillLevel] = useState('beginner');
  const [submittedPreview, setSubmittedPreview] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmittedPreview(true);
  };

  return (
    <section className="demo-section" id="demo" style={{ padding: '5rem 0', background: 'var(--bg-primary)' }}>
      <div className="container">
        <div className="admin-card" style={{ maxWidth: '720px', margin: '0 auto', padding: '2.5rem', borderRadius: '24px', boxShadow: 'var(--card-shadow-hover)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', marginBottom: '0.75rem' }}>
              ✨ STUDIO PREVIEW
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', margin: '0.5rem 0', color: 'var(--text-primary)' }}>
              Make Your Own Course
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Describe your ideal curriculum subject to preview CourseCraft AI generation.
            </p>
          </div>

          <form className="demo-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="courseTitle">Course Subject / Title</label>
              <input
                type="text"
                id="courseTitle"
                placeholder="e.g., Advanced React Patterns & State Management"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="courseDescription">What specific topics should be covered?</label>
              <textarea
                id="courseDescription"
                rows="3"
                placeholder="Describe key concepts, subtopics, and target skills..."
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="skillLevel">Target Learner Level</label>
              <select
                id="skillLevel"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
              >
                <option value="beginner">Beginner — Step-by-step introduction</option>
                <option value="intermediate">Intermediate — Practical real-world patterns</option>
                <option value="advanced">Advanced — Deep architectural mastery</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', marginTop: '1rem' }}>
              Preview AI Curriculum Outlines &rarr;
            </button>
          </form>

          {submittedPreview && (
            <div style={{ marginTop: '1.75rem', padding: '1.25rem', background: 'var(--primary-light)', borderRadius: '12px', border: '1px solid #C7D2FE' }}>
              <div style={{ fontWeight: '700', color: 'var(--primary-color)', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-check-circle"></i> Preview Generated for "{title || 'Sample Course'}"
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                Sign up or log in to run full multi-module curriculum generation, Gemini quiz creation, and speech-to-text evaluation.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Demo;