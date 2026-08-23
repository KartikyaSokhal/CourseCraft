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
    if (reviews.length === 0) return 0;
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
    <div className="dashboard-main container">
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        &larr; Back to Course
      </button>

      <div className="admin-card" style={{ maxWidth: '840px', margin: '0 auto' }}>

        {/* HEADER & SUMMARY SECTION */}
        <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>
            Learner Feedback: <span style={{ color: 'var(--primary-color)' }}>{course?.title}</span>
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem',
            background: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '16px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
                {reviews.length > 0 ? avgRating : '-'}
              </div>
              <div style={{ color: '#F59E0B', fontSize: '1.2rem', margin: '0.4rem 0' }}>
                {'★'.repeat(Math.round(Number(avgRating)))}
                <span style={{ color: '#CBD5E1' }}>{'★'.repeat(5 - Math.round(Number(avgRating)))}</span>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600' }}>
                Average Rating ({reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'})
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.35rem' }}>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = reviews.filter(r => r.rating === stars).length;
                const percent = reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0;
                return (
                  <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span style={{ width: '24px', textAlign: 'right', fontWeight: '600' }}>{stars}★</span>
                    <div style={{ flex: 1, height: '6px', background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, height: '100%', background: '#F59E0B', borderRadius: '999px' }}></div>
                    </div>
                    <span style={{ width: '32px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{percent}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SUBMIT A REVIEW */}
        {auth.user && (
          <div style={{ marginBottom: '2.5rem', background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem' }}>Leave Your Feedback</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Select Rating</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ maxWidth: '200px' }}>
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5 Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3/5 Average)</option>
                  <option value={2}>⭐⭐ (2/5 Poor)</option>
                  <option value={1}>⭐ (1/5 Teribble)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how this course helped your learning path..."
                  rows="3"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        )}

        {/* REVIEWS LIST */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            Learner Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <div className="empty-state-icon">⭐</div>
              <h3>No Reviews Yet</h3>
              <p>Be the first learner to leave a review for this course!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map(r => (
                <div key={r.id} style={{
                  padding: '1.25rem',
                  background: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--card-shadow)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                      <i className="fas fa-user-circle" style={{ marginRight: '6px', color: 'var(--primary-color)' }}></i>
                      {r.user_username || 'Student'}
                    </span>
                    <div style={{ color: '#F59E0B', fontSize: '0.9rem' }}>
                      {'★'.repeat(r.rating)}
                      <span style={{ color: '#CBD5E1' }}>{'★'.repeat(5 - r.rating)}</span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }}>
                    {r.comment}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewsPage;