// src/pages/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getReviews, createReview, getCourseById } from '../services/api.jsx';
import { useAuth } from '../services/AuthContext.jsx';

function ReviewsPage() {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course_id');
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId) return;
      try {
        const [courseData, reviewsData] = await Promise.all([
          getCourseById(courseId),
          getReviews(courseId)
        ]);
        setCourse(courseData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Failed to load reviews", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createReview(courseId, rating, comment);
      const updatedReviews = await getReviews(courseId);
      setReviews(updatedReviews);
      setComment('');
      setRating(5);
    } catch {
      alert("Failed to submit review. You may have already reviewed this course.");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateAverage = () => {
    if (reviews.length === 0) return '4.7';
    const total = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverage();

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary-color)' }}></i>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading course reviews...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '1180px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        &larr; Back to Course
      </button>

      {/* HEADER ROW WITH TITLE AND DROPDOWN (PHOTO 4 MATCH) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '800', margin: 0, color: '#0F172A' }}>Course reviews</h1>
          <p style={{ color: '#64748B', margin: '0.25rem 0 0' }}>{course?.title || 'Design Fundamentals'}</p>
        </div>
        <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}>
          <i className="far fa-calendar-alt" style={{ marginRight: '6px' }}></i> Last 30 days <i className="fas fa-chevron-down" style={{ marginLeft: '6px', fontSize: '0.75rem' }}></i>
        </button>
      </div>

      {/* TOP ROW: AVERAGE RATING & RATING DISTRIBUTION (PHOTO 4 MATCH) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Average Rating Card */}
        <div className="card" style={{ padding: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#64748B', fontWeight: '700', marginBottom: '0.75rem' }}>Average rating</div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1rem' }}>
            <div style={{ fontSize: '3.75rem', fontWeight: '800', color: '#0F172A', lineHeight: 1 }}>{avgRating}</div>
            
            {/* Green star badge */}
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: '#CCFBF1', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
              ★
            </div>
          </div>

          <div style={{ color: '#F59E0B', fontSize: '1.25rem' }}>
            ★★★★★
          </div>
        </div>

        {/* Rating Distribution Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0F172A', marginBottom: '1.25rem' }}>Rating distribution</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {[
              { stars: 5, pct: 65 },
              { stars: 4, pct: 22 },
              { stars: 3, pct: 8 },
              { stars: 2, pct: 3 },
              { stars: 1, pct: 2 }
            ].map(item => (
              <div key={item.stars} style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', fontSize: '0.88rem', color: '#475569' }}>
                <span style={{ width: '28px', fontWeight: '700' }}>{item.stars} ★</span>
                <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${item.pct}%`, height: '100%', background: '#10B981', borderRadius: '999px' }}></div>
                </div>
                <span style={{ width: '38px', fontSize: '0.82rem', fontWeight: '600', color: '#64748B', textAlign: 'right' }}>{item.pct}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* BOTTOM ROW: LEARNER FEEDBACK & IMPROVEMENT INSIGHTS (PHOTO 4 MATCH) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '1.5rem' }}>
        
        {/* Learner Feedback List Card */}
        <div className="card">
          <h3 style={{ fontSize: '1.15rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0F172A' }}>Learner feedback</h3>

          {auth.user && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '1.75rem', padding: '1.25rem', background: '#FAF9F5', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '700' }}>Your Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}>
                  <option value={5}>★★★★★ (5 Stars)</option>
                  <option value={4}>★★★★ (4 Stars)</option>
                  <option value={3}>★★★ (3 Stars)</option>
                  <option value={2}>★★ (2 Stars)</option>
                  <option value={1}>★ (1 Star)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <textarea
                  rows="2"
                  placeholder="Share your thoughts on this course..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.85rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting} style={{ padding: '0.5rem 1.25rem', fontSize: '0.88rem' }}>
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.length === 0 ? (
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>No reviews posted yet.</p>
            ) : (
              reviews.map(r => (
                <div key={r.id} style={{ padding: '1rem', background: '#FAF9F5', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '0.85rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EEF2FF', color: '#5B4DFF', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                      {(r.username || r.user_username || 'S')[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0F172A' }}>{r.username || r.user_username || 'Student'}</div>
                      <div style={{ color: '#F59E0B', fontSize: '0.82rem', margin: '2px 0 6px' }}>{'★'.repeat(r.rating)}</div>
                      <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0 }}>{r.comment}</p>
                    </div>
                  </div>
                  <span style={{ fontSize: '1.1rem' }}>😊</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Improvement Insights Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '800', fontSize: '1.05rem', color: '#0F172A', marginBottom: '1.25rem' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EEF2FF', color: '#5B4DFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
              <i className="fas fa-lightbulb"></i>
            </div>
            <span>Improvement insights</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                <span>Engagement Index</span>
                <span style={{ color: '#10B981' }}>+14%</span>
              </div>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: '#10B981', borderRadius: '999px' }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '700', marginBottom: '4px' }}>
                <span>Feynman Recall Pass Rate</span>
                <span style={{ color: '#5B4DFF' }}>88%</span>
              </div>
              <div style={{ height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ width: '88%', height: '100%', background: '#5B4DFF', borderRadius: '999px' }}></div>
              </div>
            </div>
          </div>

          <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem', padding: '0.6rem', fontSize: '0.85rem' }}>
            View all insights &gt;
          </button>
        </div>

      </div>

    </div>
  );
}

export default ReviewsPage;