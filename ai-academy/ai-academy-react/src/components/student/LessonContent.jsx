// src/components/student/LessonContent.jsx
import React, { useState } from 'react';
import { submitExplanation } from '../../services/api.jsx';

function LessonContent({ lesson, onComplete }) {
  const [explanation, setExplanation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!explanation.trim()) return;
    setIsSubmitting(true);
    try {
      const data = await submitExplanation(lesson.id, explanation);
      setAiResult(data.data);
      if (data.data && data.data.is_passed && onComplete) {
        onComplete();
      }
    } catch (err) {
      alert(err.message || 'Error submitting explanation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }}>
      
      {/* CENTER COLUMN: LESSON & VIDEO PLAYER FRAME (PHOTO 3 MATCH) */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0F172A' }}>
          {lesson.title || 'Binary Trees'}
        </h1>

        {/* Video Player Frame Graphic */}
        <div style={{ background: 'linear-gradient(135deg, #E0F2FE 0%, #EEF2FF 100%)', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(15,23,42,0.04)', position: 'relative' }}>
          
          {lesson.video_id ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: '12px', overflow: 'hidden' }}>
              <iframe
                src={`https://www.youtube.com/embed/${lesson.video_id}`}
                frameBorder="0"
                allowFullScreen
                title={lesson.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
          ) : (
            <div style={{ height: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', textAlign: 'center', padding: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#5B4DFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1rem', boxShadow: '0 4px 14px rgba(91,77,255,0.3)' }}>
                <i className="fas fa-play"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', margin: '0 0 0.25rem' }}>Interactive Lesson Visualizer</h4>
              <p style={{ fontSize: '0.85rem', color: '#64748B', maxWidth: '360px' }}>Tree data structure visualization & algorithmic step-through.</p>
            </div>
          )}

        </div>

        {/* Lesson Description Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0EDFF', color: '#5B4DFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className="fas fa-project-diagram"></i>
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: 0 }}>{lesson.title}</h3>
          </div>
          <div style={{ fontSize: '0.95rem', color: '#334155', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: lesson.content || 'A binary tree is a tree data structure in which each node has at most two children.' }} />
        </div>
      </div>

      {/* RIGHT COLUMN: KEY TAKEAWAYS & FEYNMAN BRAIN CARD (PHOTO 3 MATCH) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Key Takeaways Card */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.95rem', color: '#0F172A', marginBottom: '1rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#F0EDFF', color: '#5B4DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
              <i className="fas fa-star"></i>
            </div>
            <span>Key Takeaways</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.85rem', color: '#475569' }}>
            <li style={{ display: 'flex', gap: '0.6rem' }}>
              <i className="fas fa-share-alt" style={{ color: '#5B4DFF', marginTop: '3px' }}></i>
              <span>A binary tree has at most two children per node.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem' }}>
              <i className="fas fa-leaf" style={{ color: '#10B981', marginTop: '3px' }}></i>
              <span>The top node is called the root node.</span>
            </li>
            <li style={{ display: 'flex', gap: '0.6rem' }}>
              <i className="fas fa-chart-line" style={{ color: '#0284C7', marginTop: '3px' }}></i>
              <span>Binary trees are used in many real-world applications.</span>
            </li>
          </ul>
        </div>

        {/* Explain it in your own words (Feynman Brain Card) */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '0.95rem', color: '#0F172A', marginBottom: '0.75rem' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
              <i className="fas fa-lightbulb"></i>
            </div>
            <span>Explain it in your own words</span>
          </div>

          {/* Cute brain illustration box */}
          <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem' }}>
            <div style={{ fontSize: '2.5rem', lineHeight: 1 }}>🧠✏️</div>
          </div>

          <form onSubmit={handleSubmit}>
            <textarea
              rows="4"
              placeholder="Type your explanation here..."
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.85rem', resize: 'vertical', marginBottom: '0.75rem' }}
            />
            
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}>
              {isSubmitting ? 'Evaluating...' : 'Explain'}
            </button>
          </form>

          {aiResult && (
            <div style={{ marginTop: '0.85rem', padding: '0.75rem', borderRadius: '8px', background: aiResult.is_passed ? '#D1FAE5' : '#FEE2E2', color: aiResult.is_passed ? '#059669' : '#DC2626', fontSize: '0.8rem' }}>
              <strong>{aiResult.is_passed ? 'PASSED ✅' : 'TRY AGAIN ❌'}</strong>: {aiResult.feedback}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}

export default LessonContent;