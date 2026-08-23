// src/components/layout/Header.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { useAuth } from '../../services/AuthContext.jsx';

const LogoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.85 8.35L21.2 11.2L14.85 14.05L12 20.4L9.15 14.05L2.8 11.2L9.15 8.35L12 2Z" />
  </svg>
);

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { auth, logout } = useAuth();
  const location = useLocation();

  const closeMobileMenu = () => setIsMobileMenuOpen(false);
  const handleLogout = () => { closeMobileMenu(); logout(); };

  const isActive = (path) => location.pathname + location.search === path;

  const getLogoTarget = () => {
    if (!auth) return "/#top";
    if (auth.user?.role === 'ADMIN') return "/admin-dashboard";
    return "/student-dashboard";
  };

  return (
    <>
      <div id="top"></div>
      <header>
        <nav>
          <div className="nav-container container">
            <HashLink to={getLogoTarget()} className="logo scroll-link" aria-label="CourseCraft Home">
              <div className="logo-box"><LogoIcon /></div>
              <span className="logo-text">CourseCraft</span>
            </HashLink>

            <div className="nav-center">
              <ul className="nav-links">
                {!auth && (
                  <>
                    <li><HashLink to="/#features-section" className="scroll-link">Features</HashLink></li>
                    <li><HashLink to="/#how-it-works" className="scroll-link">How it works</HashLink></li>
                  </>
                )}

                {auth && auth.user?.role === 'ADMIN' && (
                  <>
                    <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>
                    <li>
                      <Link
                        to="/student-dashboard?tab=my-courses"
                        className={isActive('/student-dashboard?tab=my-courses') ? 'active-nav' : ''}
                      >
                        My Courses
                      </Link>
                    </li>
                  </>
                )}

                {auth && auth.user?.role === 'STUDENT' && (
                  <>
                    <li>
                      <Link
                        to="/student-dashboard?tab=my-courses"
                        className={isActive('/student-dashboard?tab=my-courses') ? 'active-nav' : ''}
                      >
                        My Courses
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/student-dashboard?tab=public"
                        className={isActive('/student-dashboard?tab=public') ? 'active-nav' : ''}
                      >
                        All Courses
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div className="nav-actions">
              {auth ? (
                <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
              ) : (
                <>
                  <Link to="/login" className="btn-link">Sign in</Link>
                  <Link to="/signup" className="btn btn-primary">Create account</Link>
                </>
              )}
            </div>

            <button className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span></span><span></span><span></span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <ul className="mobile-menu-links">
          <li><HashLink to={getLogoTarget()} onClick={closeMobileMenu}>Home</HashLink></li>

          {!auth && (
            <>
              <li><HashLink to="/#features-section" onClick={closeMobileMenu}>Features</HashLink></li>
              <li><HashLink to="/#how-it-works" onClick={closeMobileMenu}>How it works</HashLink></li>
            </>
          )}

          {auth && auth.user?.role === 'ADMIN' && (
            <li><Link to="/admin-dashboard" onClick={closeMobileMenu}>Admin Dashboard</Link></li>
          )}

          {auth && auth.user?.role === 'STUDENT' && (
            <>
              <li><Link to="/student-dashboard?tab=my-courses" onClick={closeMobileMenu}>My Courses</Link></li>
              <li><Link to="/student-dashboard?tab=public" onClick={closeMobileMenu}>All Courses</Link></li>
            </>
          )}
        </ul>

        <div className="mobile-menu-buttons">
          {auth ? (
            <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary" onClick={closeMobileMenu}>Sign in</Link>
              <Link to="/signup" className="btn btn-primary" onClick={closeMobileMenu}>Create account</Link>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Header;