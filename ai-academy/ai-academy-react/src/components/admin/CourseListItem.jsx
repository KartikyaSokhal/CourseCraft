// src/components/admin/CourseListItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function CourseListItem({ course, onPublish, onDelete }) {
  const lessonCount = (course.modules || []).reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0);
  const isPublished = course.status === 'PUBLISHED';

  return (
    <div
      className="course-list-item"
      style={{
        background: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}
    >
      <div className="course-info" style={{ flex: '1 1 200px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
          <span
            className={`badge ${isPublished ? 'badge-published' : 'badge-draft'}`}
          >
            {course.status}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {course.modules?.length || 0} Modules • {lessonCount} Lessons
          </span>
        </div>

        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, lineHeight: '1.3' }}>
          {course.title}
        </h4>
      </div>

      <div className="course-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <Link
          to={`/admin/course/${course.id}/edit`}
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
        >
          <i className="fas fa-edit"></i> Edit
        </Link>

        <button
          className="btn btn-secondary"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', color: isPublished ? 'var(--text-muted)' : 'var(--teal-accent)' }}
          onClick={() => onPublish(course.id)}
          disabled={isPublished}
        >
          {isPublished ? 'Published' : 'Publish'}
        </button>

        <button
          className="btn btn-danger"
          style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
          onClick={() => onDelete(course.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default CourseListItem;