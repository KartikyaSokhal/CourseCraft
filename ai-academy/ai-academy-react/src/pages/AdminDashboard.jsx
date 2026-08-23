// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateCourse, getCourses, deleteCourse, publishCourse } from '../services/api.jsx';
import CourseListItem from '../components/admin/CourseListItem.jsx';

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [prompt, setPrompt] = useState('');
  const [numContentModules, setNumContentModules] = useState(3);
  const [numLessonsPerModule, setNumLessonsPerModule] = useState(3);
  const [numTestModules, setNumTestModules] = useState(1);

  const [generateStatus, setGenerateStatus] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getCourses();
      setCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handlePublish = async (courseId) => {
    if (!window.confirm('Are you sure you want to publish this course?')) return;
    try {
      await publishCourse(courseId);
      loadCourses();
    } catch (err) {
      alert(`Error publishing: ${err.message}`);
    }
  };

  const handleDelete = async (courseId) => {
    if (!window.confirm('Are you sure you want to permanently delete this course?')) return;
    try {
      await deleteCourse(courseId);
      loadCourses();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerateStatus('🤖 Generating course... This is a complex task and may take several minutes.');

    try {
      await generateCourse(
        prompt,
        numContentModules,
        numLessonsPerModule,
        numTestModules
      );

      setGenerateStatus('✅ Course generated successfully!');
      setPrompt('');
      setNumContentModules(3);
      setNumLessonsPerModule(3);
      setNumTestModules(1);
      loadCourses();
    } catch (err) {
      setGenerateStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const publishedCount = courses.filter(c => c.is_published).length;
  const draftCount = courses.filter(c => !c.is_published).length;

  return (
    <div className="dashboard-main container">
      <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
          Admin Studio Dashboard
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Author, generate, and manage your academy's interactive curricula.
        </p>

        {/* Real Metrics Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.5rem'
        }}>
          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Curricula</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '0.25rem' }}>{courses.length}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Published Courses</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--teal-accent)', marginTop: '0.25rem' }}>{publishedCount}</div>
          </div>
          <div style={{ background: '#FFFFFF', padding: '1.25rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>Draft Curricula</div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning-color)', marginTop: '0.25rem' }}>{draftCount}</div>
          </div>
        </div>
      </div>

      <div className="admin-grid">
        {/* Course Generation Form */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✨</span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>Generate New Course</h2>
          </div>

          <form id="generate-form" onSubmit={handleGenerateSubmit}>
            <div className="form-group">
              <label htmlFor="prompt">Course Topic</label>
              <input
                type="text"
                id="prompt"
                placeholder="e.g., System Design, Data Structures, Modern React"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="num_content_modules">Content Modules</label>
                <input
                  type="number"
                  id="num_content_modules"
                  value={numContentModules}
                  onChange={(e) => setNumContentModules(Number(e.target.value))}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="num_lessons_per_module">Lessons / Module</label>
                <input
                  type="number"
                  id="num_lessons_per_module"
                  value={numLessonsPerModule}
                  onChange={(e) => setNumLessonsPerModule(Number(e.target.value))}
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="num_test_modules">Intermediate Tests</label>
              <input
                type="number"
                id="num_test_modules"
                value={numTestModules}
                onChange={(e) => setNumTestModules(Number(e.target.value))}
                min="0"
                max="5"
                required
              />
              <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.35rem' }}>
                Intermediate quizzes will be placed periodically between module blocks.
              </small>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Generating with AI...
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i> Generate Course
                </>
              )}
            </button>
          </form>

          {generateStatus && (
            <div style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              borderRadius: '10px',
              fontSize: '0.9rem',
              background: generateStatus.includes('❌') ? 'var(--error-light)' : 'var(--primary-light)',
              color: generateStatus.includes('❌') ? 'var(--error-color)' : 'var(--primary-color)',
              border: `1px solid ${generateStatus.includes('❌') ? '#FCA5A5' : '#C7D2FE'}`
            }}>
              {generateStatus}
            </div>
          )}
        </div>

        {/* Manage Courses List */}
        <div className="admin-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '700', margin: 0 }}>Manage Courses</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{courses.length} Items</span>
          </div>

          <div id="course-list">
            {loading && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary-color)' }}></i>
                <p style={{ marginTop: '0.75rem' }}>Loading courses...</p>
              </div>
            )}

            {error && (
              <div style={{ color: 'var(--error-color)', padding: '0.85rem', background: 'var(--error-light)', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            {!loading && courses.length === 0 && (
              <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
                <div className="empty-state-icon">📝</div>
                <h3>No Courses Created</h3>
                <p>Use the form on the left to generate your first AI course curriculum.</p>
              </div>
            )}

            {!loading && courses.map(course => (
              <CourseListItem
                key={course.id}
                course={course}
                onPublish={handlePublish}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;