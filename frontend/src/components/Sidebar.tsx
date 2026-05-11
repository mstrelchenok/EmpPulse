import React from 'react';
import type { ScreenType } from '../types';

interface Props {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
}

const Sidebar: React.FC<Props> = ({ currentScreen, setScreen }) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <h1 className="brand-logo" onClick={() => setScreen('employees')} style={{ cursor: 'pointer' }}>
          EmpPulse
        </h1>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentScreen === 'employees' ? 'active' : ''}`}
            onClick={() => setScreen('employees')}
          >
            Employees
          </button>
          <button
            className={`nav-item ${currentScreen === 'request-manager' ? 'active' : ''}`}
            onClick={() => setScreen('request-manager')}
          >
            Request manager
          </button>
          <button
            className={`nav-item ${currentScreen === 'my-requests' ? 'active' : ''}`}
            onClick={() => setScreen('my-requests')}
          >
            My requests
          </button>
          <button
            className={`nav-item ${currentScreen === 'departments' ? 'active' : ''}`}
            onClick={() => setScreen('departments')}
          >
            Department list
          </button>
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="user-profile" onClick={() => setScreen('my-profile')} style={{ cursor: 'pointer' }}>
          <div className="user-avatar"></div>
          <div className="user-info">
            <span className="user-name">Mikita Sirosh</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>

        <div className="sidebar-controls">
          <div className="theme-toggle">
            <div className="toggle-thumb">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            </div>
          </div>
          <div className="lang-toggles">
            <span className="lang-icon">🇬🇧</span>
            <span className="lang-icon" style={{ opacity: 0.4 }}>🇺🇦</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
