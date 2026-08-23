// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './HomePage/Hero';
import Features from './HomePage/Features';

function HomePage() {
  return (
    <>
      <Hero />
      <Features />

      {/* SECTION 5: CLEAN FINAL CTA */}
      <section className="final-cta-section" style={{ padding: '5rem 0 6rem', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="admin-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '3.5rem 2rem', borderRadius: '24px', background: '#FFFFFF', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }}>
            <span className="badge" style={{ background: '#EEF2FF', color: '#6366F1', marginBottom: '1rem' }}>
              GET STARTED TODAY
            </span>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '800', margin: '0.5rem 0 1rem', color: 'var(--text-primary)' }}>
              Ready to Transform How You Author & Learn?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '540px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
              Create your account to author AI-generated curricula, track student progression, and evaluate active Feynman speech recall.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                Create account &rarr;
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HomePage;