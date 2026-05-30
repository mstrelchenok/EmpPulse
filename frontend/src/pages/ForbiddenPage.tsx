import React from 'react';

interface Props {
  onHome: () => void;
}

const ForbiddenPage: React.FC<Props> = ({ onHome }) => {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <h1 className="auth-brand">EmpPulse</h1>
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '3rem', margin: 0, color: '#d32f2f' }}>403</h2>
          <h3 style={{ marginTop: '1rem', color: '#666' }}>Access Denied</h3>
          <p style={{ marginTop: '1rem', color: '#999' }}>
            You don't have permission to access this resource.
          </p>
          <button className="primary-btn auth-submit-btn" onClick={onHome} style={{ marginTop: '2rem' }}>
            Go to home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForbiddenPage;
