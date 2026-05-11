import React, { useState } from 'react';
import type { ScreenType } from '../types';

interface Props {
  onLoginSuccess: (nextScreen: ScreenType) => void;
}

const LoginPage: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic authentication check matching your flow
    if (email && password) {
      onLoginSuccess('employees');
    } else {
      setError('Please fill in both fields.');
    }
  };

  return (
    /* 1. auth-layout forces full screen height, grey background, and centers content */
    <div className="auth-layout">
      
      
      <div className="auth-card">
        
        <h1 className="auth-brand">EmpPulse</h1>
        <h2 className="auth-title">Log In</h2>
        
        {error && <div className="auth-error-msg">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <label className="auth-input-label">
            Email
            <input 
              type="email"  
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </label>

          <label className="auth-input-label">
            Password
            <input 
              type="password"  
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </label>

          <button type="submit" className="primary-btn auth-submit-btn">
            log in
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;