import React from 'react';

function CourseCard({ course, onViewCourse }) {

  const getAverageRating = () => {
    if (course.average_rating !== undefined && course.average_rating !== null) {
      return parseFloat(course.average_rating);
    }
    if (course.reviews && course.reviews.length > 0) {
      const total = course.reviews.reduce((acc, review) => acc + review.rating, 0);
      return total / course.reviews.length;
    }
    return 0;
  };

  const rating = getAverageRating();
  const hasRating = rating > 0;
  const moduleCount = course.modules ? course.modules.length : 0;

  return (
    <div
      className="course-card"
      onClick={() => onViewCourse(course.id)}
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: 'var(--card-shadow)',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <span className="badge" style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: '600', fontSize: '0.75rem' }}>
            <i className="fas fa-book"></i> Course
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <i className="fas fa-user-circle" style={{ marginRight: '4px' }}></i>
            {course.creator_username || 'Admin'}
          </span>
        </div>

        <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.4' }}>
          {course.title}
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {course.description || 'Interactive AI-generated curriculum with assessments and Feynman technique exercises.'}
        </p>
      </div>

      <div>
        <div className="course-meta" style={{ padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', marginBottom: '1rem' }}>
          <span style={{ fontWeight: '500' }}>
            <i className="fas fa-layer-group" style={{ color: 'var(--primary-color)', marginRight: '6px' }}></i>
            {moduleCount} {moduleCount === 1 ? 'Module' : 'Modules'}
          </span>

          <span style={{ fontWeight: '500' }}>
            <i className="fas fa-star" style={{ color: hasRating ? '#F59E0B' : '#CBD5E1', marginRight: '4px' }}></i>
            {hasRating ? rating.toFixed(1) : 'New'}
          </span>
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.65rem 1rem', fontSize: '0.9rem', borderRadius: '10px' }}
        >
          View Course &rarr;
        </button>
      </div>
    </div>
  );
}

export default CourseCard;