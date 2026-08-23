// src/components/student/CourseSidebar.jsx
import React, { useState } from 'react';

function Module({ module, currentItem, onSelectItem, allItems }) {
  const [isOpen, setIsOpen] = useState(!module.is_locked);
  const isActiveModule = currentItem.moduleId === module.id;

  return (
    <div className={`module ${isOpen ? 'active' : ''}`} style={{ marginBottom: '0.75rem' }}>
      <div
        className="module-header"
        onClick={() => {
          if (module.is_locked) {
            const globalIndex = allItems.findIndex(item => item.type === 'locked' && item.moduleId === module.id);
            if (globalIndex !== -1) onSelectItem(globalIndex);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        style={{
          padding: '0.75rem 1rem',
          background: isActiveModule ? 'var(--primary-light)' : '#FFFFFF',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: '10px',
          fontWeight: '600',
          fontSize: '0.92rem',
          border: isActiveModule ? '1px solid #C7D2FE' : '1px solid var(--border-color)',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {module.is_locked ? (
            <i className="fas fa-lock" style={{ color: '#94A3B8' }} title="Locked"></i>
          ) : module.is_completed ? (
            <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }} title="Completed"></i>
          ) : (
            <i className="fas fa-play-circle" style={{ color: 'var(--primary-color)' }}></i>
          )}

          <span style={{ color: module.is_locked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
            {module.title}
          </span>
        </span>

        {!module.is_locked && (
          <i className="fas fa-chevron-down" style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}></i>
        )}
      </div>

      {module.is_locked && (
        <div
          onClick={() => {
            const globalIndex = allItems.findIndex(item => item.type === 'locked' && item.moduleId === module.id);
            if (globalIndex !== -1) onSelectItem(globalIndex);
          }}
          style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <i className="fas fa-lock" style={{ fontSize: '0.7rem' }}></i>
          <span>Complete previous module to unlock</span>
        </div>
      )}

      {isOpen && !module.is_locked && (
        <ul className="lesson-list" style={{ listStyle: 'none', paddingLeft: '0.75rem', marginTop: '0.4rem' }}>
          {module.module_type === 'CONTENT' && module.lessons?.map(lesson => {
            const globalIndex = allItems.findIndex(item => item.type === 'lesson' && item.data.id === lesson.id);
            const isActive = currentItem.type === 'lesson' && currentItem.data.id === lesson.id;

            return (
              <li key={lesson.id} style={{ marginBottom: '0.2rem' }}>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onSelectItem(globalIndex); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    background: isActive ? 'var(--primary-color)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? '600' : '400',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <i className={`fas fa-${lesson.video_id ? 'play-circle' : 'file-alt'}`}
                     style={{ marginRight: '8px', fontSize: '0.85em', opacity: isActive ? 1 : 0.7 }}>
                  </i>
                  {lesson.title}
                </a>
              </li>
            );
          })}

          {module.module_type === 'ASSESSMENT' && module.quiz && (() => {
             const globalIndex = allItems.findIndex(item => item.type === 'quiz' && item.data.id === module.quiz.id);
             const isActive = currentItem.type === 'quiz' && currentItem.data.id === module.quiz.id;

             return (
               <li key={module.quiz.id}>
                 <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); onSelectItem(globalIndex); }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      background: isActive ? 'var(--primary-color)' : 'transparent',
                      textDecoration: 'none',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.15s ease'
                    }}
                 >
                   <i className="fas fa-clipboard-check"
                      style={{ marginRight: '8px', fontSize: '0.85em', opacity: isActive ? 1 : 0.7 }}>
                   </i>
                   {module.quiz.title || "Module Assessment"}
                 </a>
               </li>
             );
          })()}
        </ul>
      )}
    </div>
  );
}

function CourseSidebar({ course, currentItem, onSelectItem, allItems }) {
  if (!course) return null;

  const totalModules = course.modules ? course.modules.length : 0;
  const completedModules = course.modules ? course.modules.filter(m => m.is_completed).length : 0;
  const progressPercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return (
    <div className="course-sidebar-inner">
      <div style={{ marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: '1.3' }}>
          {course.title}
        </h3>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
          <span>Course Progress</span>
          <span style={{ color: 'var(--teal-accent)' }}>{progressPercent}%</span>
        </div>

        <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--teal-accent)', borderRadius: '999px', transition: 'width 0.3s ease' }}></div>
        </div>
      </div>

      <div id="module-list">
        {course.modules?.map(module => (
          <Module
            key={module.id}
            module={module}
            currentItem={currentItem}
            onSelectItem={onSelectItem}
            allItems={allItems}
          />
        ))}
      </div>
    </div>
  );
}

export default CourseSidebar;