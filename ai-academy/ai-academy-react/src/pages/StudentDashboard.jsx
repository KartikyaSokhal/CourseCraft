// src/pages/StudentDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCourses, getCourseById, generateCourse } from '../services/api.jsx';
import { useAuth } from '../services/AuthContext.jsx';
import CourseCard from '../components/student/CourseCard.jsx';
import CourseViewer from '../components/student/CourseViewer.jsx';

function StudentDashboard() {
  const { auth } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState('list');

  const activeTab = searchParams.get('tab') || 'my-courses';

  const setActiveTab = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const [prompt, setPrompt] = useState('');
  const [numModules, setNumModules] = useState(3);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getCourses();
      setAllCourses(data);
    } catch (err) {
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleViewCourse = async (courseId) => {
    setLoading(true);
    setError('');
    try {
      const courseData = await getCourseById(courseId);
      setSelectedCourse(courseData);
      setView('viewer');
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || 'Failed to load course details.');
      setView('list');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedCourse(null);
  };

  const handleGenerateSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await generateCourse(prompt, numModules, 2, 1);
      alert('Course generated successfully!');
      setPrompt('');
      loadCourses();
      setActiveTab('my-courses');
    } catch (err) {
      alert(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const myCourses = allCourses.filter(c => c.creator_username === auth.user?.username);
  const publicCourses = allCourses;

  return (
    <main className="dashboard-main container">
      {view === 'list' ? (
        <div id="course-list-view" className="fade-in-up">
          <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  Welcome back, {auth.user?.username || 'Learner'}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Track your progression and explore your courses.
                </p>
              </div>

              <div className="tabs-header" style={{ margin: 0, border: 'none', padding: 0 }}>
                <button
                  className={`tab-btn ${activeTab === 'my-courses' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my-courses')}
                >
                  My Courses ({myCourses.length})
                </button>
                <button
                  className={`tab-btn ${activeTab === 'public' ? 'active' : ''}`}
                  onClick={() => setActiveTab('public')}
                >
                  All Courses ({publicCourses.length})
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              <i className="fas fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary-color)' }}></i>
              <p style={{ marginTop: '1rem', fontWeight: '500' }}>Loading courses...</p>
            </div>
          )}

          {error && (
            <div style={{ color: 'var(--error-color)', padding: '1rem 1.25rem', background: 'var(--error-light)', borderRadius: '12px', border: '1px solid #FCA5A5', marginBottom: '1.5rem' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {error}
            </div>
          )}

          {/* --- TAB CONTENT: MY COURSES --- */}
          {activeTab === 'my-courses' && (
            <section className="tab-content fade-in">
              {!loading && myCourses.length > 0 ? (
                <div className="course-grid">
                  {myCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onViewCourse={handleViewCourse}
                    />
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📚</div>
                    <h3>No Courses Yet</h3>
                    <p>You have not created any courses yet. Browse all available courses to start learning.</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab('public')}>
                      View All Courses
                    </button>
                  </div>
                )
              )}
            </section>
          )}

          {/* --- TAB CONTENT: ALL COURSES --- */}
          {activeTab === 'public' && (
            <section className="tab-content fade-in">
              {!loading && publicCourses.length > 0 ? (
                <div className="course-grid">
                  {publicCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onViewCourse={handleViewCourse}
                    />
                  ))}
                </div>
              ) : (
                !loading && (
                  <div className="empty-state">
                    <div className="empty-state-icon">📖</div>
                    <h3>No Courses Found</h3>
                    <p>There are currently no courses available.</p>
                  </div>
                )
              )}
            </section>
          )}

          {/* --- TAB CONTENT: CREATE (ADMIN RESTRICTED) --- */}
          {activeTab === 'create' && (
            <section className="tab-content fade-in">
              <div className="admin-card" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {auth.user?.role !== 'ADMIN' ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', fontWeight: '700' }}>Admin Access Required</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                      AI Course Generation is restricted to authorized Admin accounts. As a Student, you can view existing courses or promote your account using the command line.
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                      <button className="btn btn-primary" onClick={() => setActiveTab('public')}>
                        View All Courses
                      </button>
                      <button className="btn btn-secondary" onClick={() => setActiveTab('my-courses')}>
                        My Courses
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                      <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: '700' }}>What do you want to learn today?</h2>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Enter a topic, and our AI will build a curriculum for you.</p>
                    </div>

                    <form onSubmit={handleGenerateSubmit}>
                      <div className="form-group">
                        <label>Topic / Subject</label>
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="e.g., Advanced React Patterns, History of Rome..."
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Number of Modules (1-5)</label>
                        <input
                          type="number"
                          value={numModules}
                          onChange={(e) => setNumModules(Number(e.target.value))}
                          min="1" max="5"
                          required
                        />
                      </div>

                      <div style={{ marginTop: '2rem' }}>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isGenerating}
                          style={{ width: '100%', padding: '0.9rem', fontSize: '1.05rem' }}
                        >
                          {isGenerating ? (
                            <>
                              <i className="fas fa-spinner fa-spin"></i> Generating Course...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-magic"></i> Generate Course
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </section>
          )}
        </div>
      ) : (
        <CourseViewer
          course={selectedCourse}
          onBack={handleBackToList}
          onRefreshCourse={() => handleViewCourse(selectedCourse.id)}
        />
      )}
    </main>
  );
}

export default StudentDashboard;