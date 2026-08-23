// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { generateCourse, getCourses, deleteCourse, publishCourse } from '../services/api.jsx';
import CourseListItem from '../components/admin/CourseListItem.jsx';

function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState('');

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
    setGenerateStatus('🤖 Generating course with Gemini AI...');

    try {
      await generateCourse(
        prompt,
        numContentModules,
        numLessonsPerModule,
        numTestModules
      );

      setGenerateStatus('✅ Course generated successfully!');
      setPrompt('');
      loadCourses();
    } catch (err) {
      setGenerateStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="admin-layout" style={{ background: '#FAF9F5', minHeight: '100vh' }}>
      
      {/* LEFT SIDEBAR NAVIGATION (PHOTO 1 MATCH) */}
      <aside className="admin-sidebar">
        <div>
          <div className="logo" style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
            <div className="logo-box"><i className="fas fa-sparkles"></i></div>
            <span style={{ fontSize: '1.2rem', fontWeight: '800' }}>CourseCraft</span>
          </div>

          <ul className="admin-sidebar-nav">
            <li><a href="#overview" className="active"><i className="fas fa-home"></i> Overview</a></li>
            <li><a href="#courses"><i className="fas fa-desktop"></i> Courses</a></li>
            <li><a href="#learners"><i className="fas fa-user-friends"></i> Learners</a></li>
            <li><a href="#analytics"><i className="fas fa-chart-bar"></i> Analytics</a></li>
            <li><a href="#ai-studio"><i className="fas fa-sparkles"></i> AI Studio</a></li>
            <li><a href="#content"><i className="fas fa-folder"></i> Content Library</a></li>
            <li><a href="#settings"><i className="fas fa-cog"></i> Settings</a></li>
          </ul>
        </div>

        <div className="admin-sidebar-promo">
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>🎓</div>
          <div style={{ fontWeight: '800', fontSize: '0.85rem', color: '#1E1B4B' }}>AI-Powered.</div>
          <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>Learning Elevated.</div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ paddingBottom: '3rem' }}>
        
        {/* TOP BAR */}
        <div className="admin-top-bar">
          <div className="admin-search-input">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search courses, learners, and more..." readOnly />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <i className="fas fa-bell" style={{ color: '#64748B', fontSize: '1.1rem', cursor: 'pointer' }}></i>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#EEF2FF', color: '#5B4DFF', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.88rem' }}>
                AD
              </div>
              <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>Admin <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem' }}></i></span>
            </div>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
          
          {/* HEADER BANNER WITH FRIENDLY ROBOT ILLUSTRATION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>Admin overview</h1>
              <p style={{ color: '#475569', fontSize: '1rem', marginTop: '0.25rem' }}>Welcome back! Here's what's happening with your academy.</p>
            </div>
            
            {/* Friendly robot graphic illustration badge */}
            <div style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #E0F2FE 100%)', padding: '0.65rem 1.25rem', borderRadius: '16px', border: '1px solid #C7D2FE', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#5B4DFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>
                🤖
              </div>
              <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#1E1B4B' }}>Gemini 1.5 Studio Active</div>
            </div>
          </div>

          {/* THREE STAT CARDS (PHOTO 1 MATCH) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
            
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#EEF2FF', color: '#5B4DFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-user-friends"></i>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: '600' }}>Total learners</div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0F172A' }}>12,580</div>
              <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '700', marginTop: '0.35rem' }}>↑ 18.6% vs last 30 days</div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-layer-group"></i>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: '600' }}>Active courses</div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0F172A' }}>{courses.length || 86}</div>
              <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '700', marginTop: '0.35rem' }}>↑ 12.3% vs last 30 days</div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#CCFBF1', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-bullseye"></i>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#64748B', fontWeight: '600' }}>Completion rate</div>
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: '800', color: '#0F172A' }}>68%</div>
              <div style={{ fontSize: '0.8rem', color: '#10B981', fontWeight: '700', marginTop: '0.35rem' }}>↑ 8.7% vs last 30 days</div>
            </div>

          </div>

          {/* MAIN TWO-COLUMN DASHBOARD GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '2rem' }}>
            
            {/* LEFT COLUMN: COURSE GENERATION & MANAGED COURSES */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Course Generator Card */}
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: '#0F172A' }}>
                  ✨ Generate New Course
                </h3>
                
                <form onSubmit={handleGenerateSubmit}>
                  <div className="form-group">
                    <label htmlFor="prompt">Course Subject / Prompt</label>
                    <input
                      type="text"
                      id="prompt"
                      placeholder="e.g. Leadership Fundamentals, Data Analytics, Python 101"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Modules</label>
                      <input type="number" value={numContentModules} onChange={(e) => setNumContentModules(Number(e.target.value))} min="1" max="10" required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Lessons/Module</label>
                      <input type="number" value={numLessonsPerModule} onChange={(e) => setNumLessonsPerModule(Number(e.target.value))} min="1" max="10" required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: '700' }}>Quizzes</label>
                      <input type="number" value={numTestModules} onChange={(e) => setNumTestModules(Number(e.target.value))} min="0" max="5" required style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #CBD5E1' }} />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={isGenerating} style={{ width: '100%', marginTop: '1.25rem' }}>
                    {isGenerating ? 'Generating Course...' : 'Generate with AI →'}
                  </button>
                </form>

                {generateStatus && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem', borderRadius: '8px', background: '#F0EDFF', color: '#5B4DFF', fontSize: '0.88rem' }}>
                    {generateStatus}
                  </div>
                )}
              </div>

              {/* Course Performance / Drafts List Table */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Course catalog & drafts</h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>{courses.length} total items</span>
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>Loading catalog...</div>
                ) : courses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#64748B' }}>No courses found. Generate one above!</div>
                ) : (
                  courses.map(course => (
                    <CourseListItem
                      key={course.id}
                      course={course}
                      onPublish={handlePublish}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>

            </div>

            {/* RIGHT COLUMN: AI GENERATION ACTIVITY (PHOTO 1 MATCH) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Create with AI Banner Card */}
              <div style={{ background: 'linear-gradient(135deg, #5B4DFF 0%, #7C3AED 100%)', borderRadius: '20px', padding: '1.75rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0 }}>Create with AI</h4>
                  <p style={{ fontSize: '0.88rem', opacity: 0.9, marginTop: '0.25rem' }}>Generate courses, lessons, and content in seconds.</p>
                </div>
                <div style={{ fontSize: '1.5rem', background: 'rgba(255,255,255,0.2)', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  &gt;
                </div>
              </div>

              {/* AI Generation Activity Feed */}
              <div className="card">
                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', marginBottom: '1.25rem', color: '#0F172A' }}>
                  AI generation activity
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#F0EDFF', color: '#5B4DFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-sparkles"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Course generated</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Leadership Fundamentals</div>
                      </div>
                    </div>
                    <i className="fas fa-check-circle" style={{ color: '#10B981' }}></i>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-file-alt"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Lesson outline created</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Communication Skills</div>
                      </div>
                    </div>
                    <i className="fas fa-check-circle" style={{ color: '#10B981' }}></i>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#CCFBF1', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="fas fa-check-square"></i>
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.88rem' }}>Quiz created</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748B' }}>Time Management Mastery</div>
                      </div>
                    </div>
                    <i className="fas fa-check-circle" style={{ color: '#10B981' }}></i>
                  </div>

                </div>
              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;