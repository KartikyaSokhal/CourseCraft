// src/components/student/CourseViewer.jsx
import React, { useState, useMemo } from 'react';
import CourseSidebar from './CourseSidebar';
import LessonContent from './LessonContent';
import StudentQuizView from './StudentQuizView'; // <-- Import new component

function CourseViewer({ course, onBack, onRefreshCourse }) {

  // Flatten the course structure into a linear list of items
  // An item can be: { type: 'lesson', data: ... } OR { type: 'quiz', data: ... } OR { type: 'locked', module: ... }
  const allItems = useMemo(() => {
    const items = [];
    (course.modules || []).forEach(module => {
      if (module.is_locked) {
        items.push({ type: 'locked', module: module, moduleId: module.id });
      } else if (module.module_type === 'CONTENT') {
        // Add all lessons from this module
        (module.lessons || []).forEach(lesson => {
          items.push({ type: 'lesson', data: lesson, moduleId: module.id });
        });
      } else if (module.module_type === 'ASSESSMENT' && module.quiz) {
        // Add the quiz as a single item
        items.push({ type: 'quiz', data: module.quiz, moduleId: module.id });
      }
    });
    return items;
  }, [course]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = allItems[currentIndex];

  if (!currentItem) {
    return (
      <div className="container" style={{ padding: '2rem' }}>
        <h2>{course.title}</h2>
        <p>This course has no content yet.</p>
        <button onClick={onBack} className="btn btn-secondary">Back to List</button>
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

  // Helper to handle sidebar clicks
  const handleSelectItem = (itemIndex) => {
    setCurrentIndex(itemIndex);
    window.scrollTo(0, 0);
  };

  return (
    <div id="course-viewer" className="learning-interface" style={{ display: 'grid' }}>
      <aside className="course-sidebar">
        <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1rem', width: '100%' }}>
          &larr; Back to Courses
        </button>

        <CourseSidebar
          course={course}
          currentItem={currentItem}
          onSelectItem={handleSelectItem}
          allItems={allItems} // Pass the flattened list to help map indices
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
          <div className="locked-module-message" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', margin: '1rem 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(156, 163, 175, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <i className="fas fa-lock" style={{ fontSize: '1.8rem', color: '#9ca3af' }}></i>
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{currentItem.module.title} is Locked</h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
              Complete the previous module's assessment or Feynman challenge to unlock this content and continue your learning path.
            </p>
          </div>
        )}

        <div className="lesson-navigation" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn btn-secondary"
            onClick={goToPrev}
            disabled={currentIndex === 0}
          >
            &larr; Previous
          </button>
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