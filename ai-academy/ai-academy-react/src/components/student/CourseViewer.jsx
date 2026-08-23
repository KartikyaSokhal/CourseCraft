// src/components/student/CourseViewer.jsx
import React, { useState, useMemo } from 'react';
import CourseSidebar from './CourseSidebar';
import LessonContent from './LessonContent';
import StudentQuizView from './StudentQuizView';

function CourseViewer({ course, onBack, onRefreshCourse }) {
  
  const allItems = useMemo(() => {
    const items = [];
    (course.modules || []).forEach(module => {
      if (module.is_locked) {
        items.push({ type: 'locked', module: module, moduleId: module.id });
      } else if (module.module_type === 'CONTENT') {
        (module.lessons || []).forEach(lesson => {
          items.push({ type: 'lesson', data: lesson, moduleId: module.id });
        });
      } else if (module.module_type === 'ASSESSMENT' && module.quiz) {
        items.push({ type: 'quiz', data: module.quiz, moduleId: module.id });
      }
    });
    return items;
  }, [course]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = allItems[currentIndex];

  if (!currentItem) {
    return (
      <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.75rem' }}>{course.title}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>This course has no content modules yet.</p>
        <button onClick={onBack} className="btn btn-secondary">&larr; Back to Courses</button>
      </div>
    );
  }

  const goToNext = () => {
    if (currentIndex < allItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
      window.scrollTo(0, 0);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSelectItem = (itemIndex) => {
    setCurrentIndex(itemIndex);
    window.scrollTo(0, 0);
  };

  return (
    <div id="course-viewer" className="learning-interface" style={{ display: 'grid' }}>
      <aside className="course-sidebar">
        <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1.25rem', width: '100%', padding: '0.6rem', fontSize: '0.88rem' }}>
          &larr; Back to Courses
        </button>
        
        <CourseSidebar
          course={course}
          currentItem={currentItem}
          onSelectItem={handleSelectItem}
          allItems={allItems}
        />
      </aside>
      
      <section className="viewer-main-content">
        {/* RENDER CONTENT BASED ON TYPE */}
        {currentItem.type === 'lesson' ? (
          <LessonContent 
            lesson={currentItem.data} 
            courseId={course.id} 
            onComplete={onRefreshCourse}
          />
        ) : currentItem.type === 'quiz' ? (
          <StudentQuizView 
            quiz={currentItem.data} 
            moduleId={currentItem.moduleId}
            onComplete={onRefreshCourse}
          />
        ) : (
          <div className="locked-module-message" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: '#FFFFFF', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', margin: '1rem 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary-color)' }}>
              <i className="fas fa-lock" style={{ fontSize: '1.8rem' }}></i>
            </div>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              {currentItem.module.title} is Locked
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.6', fontSize: '0.98rem' }}>
              Complete the previous module's assessment or Feynman challenge to unlock this unit and continue your progression.
            </p>
          </div>
        )}

        <div className="lesson-navigation" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn btn-secondary"
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            &larr; Previous Lesson
          </button>
          
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            Step {currentIndex + 1} of {allItems.length}
          </span>

          <button
            className="btn btn-primary"
            onClick={goToNext}
            disabled={currentIndex === allItems.length - 1}
          >
            {currentIndex === allItems.length - 1 ? 'Finish Course' : 'Next &rarr;'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default CourseViewer;