import React, { useState } from 'react';
import type { ModalType, Employee, LeaveRequest } from '../types';
import { MOCK_LOGGED_HOURS } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';

interface Props {
  isMyProfile?: boolean;
  employee?: Employee | null;
  openModal: (modal: ModalType, emp?: Employee, requestObj?: LeaveRequest) => void;
}

const ProfilePage: React.FC<Props> = ({ isMyProfile, employee, openModal }) => {
  const { currentUser } = useAuth();
  const [loggedExpanded, setLoggedExpanded] = useState(true);
  const [unpaidExpanded, setUnpaidExpanded] = useState(true);

  const targetName = isMyProfile
    ? [currentUser?.name, currentUser?.surname].filter(Boolean).join(' ')
    : employee?.name || 'Andrei Didenko';
  const targetEmail = isMyProfile
    ? currentUser?.email ?? ''
    : employee?.email || 'andrei.didenko@email.com';

  return (
    <div className="screen-container">
      <header className="page-header" style={{ marginBottom: 24 }}>
        <h2>{isMyProfile ? 'My Profile' : "Employee's Profile"}</h2>
        {isMyProfile && (
          <button className="btn-logout-pill" onClick={() => openModal('LOGOUT')}>log out</button>
        )}
      </header>

      <div className="profile-top-grid">
        <div className="profile-banner">
          <div className="banner-info">
            <h3>{targetName}</h3>
            <p className="email-sub">{targetEmail}</p>
            {/*
              HIDDEN FOR NOW (not deleted): "Change password" button.
              Intentionally not rendered on the user's own profile until the
              change-password flow is wired to the API. Restore by re-enabling
              this button for the isMyProfile case.
            */}
            {!isMyProfile && (
              <button
                className="btn-pill-action"
                onClick={() => alert('Edit profile triggered')}
              >
                Edit profile
              </button>
            )}
          </div>
          <div className="banner-stats">
            <div><label>Department:</label><span></span></div>
            <div><label>Role:</label><span></span></div>
            <div><label>Status:</label><span></span></div>
          </div>
        </div>

        <div className="vacation-widget">
          <h4>Vacation balance</h4>
          <div className="balance-badge-card">Vacations day left: </div>
        </div>
      </div>

      {/*
        HIDDEN FOR NOW (not deleted): "Logged hours" table.
        Intentionally not rendered until logged-hours data is wired to the API.
        Restore by changing the `false &&` guard below back to `true`.
        Note: the rows still use MOCK_LOGGED_HOURS as placeholder data.
      */}
      {false && (
        <div className="accordion-section" style={{ marginTop: 32 }}>
          <h3 className="department-title" onClick={() => setLoggedExpanded(!loggedExpanded)}>
            Logged hours <span className={`chevron ${loggedExpanded ? 'expanded' : ''}`}>►</span>
          </h3>

          {loggedExpanded && (
            <div className="card-box table-box">
              <div className="table-header-grid">
                <span>Date</span><span>Start</span><span>End</span><span>Duration</span>
              </div>
              {MOCK_LOGGED_HOURS.map((log, i) => (
                <div key={i} className="table-row-grid">
                  <span>{log.date}</span><span>{log.start}</span><span>{log.end}</span><span>{log.duration}</span>
                </div>
              ))}
              <div className="table-footer-actions">
                <button className="btn-tiny-pill">show more</button>
                <button className="btn-tiny-pill">show less</button>
              </div>
            </div>
          )}
        </div>
      )}

      {!isMyProfile && (
        <div className="center-action" style={{ marginTop: 24, marginBottom: 24 }}>
          <button className="primary-btn" onClick={() => openModal('LOG_HOURS', employee as Employee)}>+ log hours</button>
        </div>
      )}

      {/*
        HIDDEN FOR NOW (not deleted): "Unpaid hours" table.
        Intentionally not rendered until unpaid-hours data is wired to the API.
        Restore by changing the `false &&` guard below back to `true`.
        Note: the rows still use MOCK_LOGGED_HOURS as placeholder data.
      */}
      {false && (
        <div className="accordion-section" style={{ marginTop: isMyProfile ? 32 : 0 }}>
          <h3 className="department-title" onClick={() => setUnpaidExpanded(!unpaidExpanded)}>
            Unpaid hours <span className={`chevron ${unpaidExpanded ? 'expanded' : ''}`}>🡇</span>
          </h3>

          {unpaidExpanded && (
            <div className="card-box table-box">
              <div className="table-header-grid">
                <span>Date</span><span>Start</span><span>End</span><span>Duration</span>
              </div>
              {MOCK_LOGGED_HOURS.map((log, i) => (
                <div key={i} className="table-row-grid">
                  <span>{log.date}</span><span>{log.start}</span><span>{log.end}</span><span>{log.duration}</span>
                </div>
              ))}
              <div className="table-footer-actions">
                <button className="btn-tiny-pill">show more</button>
                <button className="btn-tiny-pill">show less</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
