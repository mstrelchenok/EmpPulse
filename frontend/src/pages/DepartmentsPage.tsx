import React, { useState } from 'react';
import type { ModalType, Department } from '../types';
import trashIcon from '../assets/trash-icon.png.webp';
import { useAuth } from '../context/AuthContext';

interface Props {
  departments: Department[];
  loading?: boolean;
  openModal: (modal: ModalType, dept?: Department) => void;
  onSelectDepartment: (dept: Department) => void;
}

const DepartmentsScreen: React.FC<Props> = ({ departments, loading = false, openModal, onSelectDepartment }) => {
  const { currentUser, userRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const isOwner = userRole === 'OWNER';

  // Admins may only see the departments they administer.
  const visibleDepartments = isOwner
    ? departments
    : departments.filter(dept => currentUser?.adminProfile?.departmentIds.includes(dept.id));

  const filteredDepartments = visibleDepartments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="screen-container">
      <header className="page-header">
        <h2>Departments</h2>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-dropdown"><span>Filter by</span>...</div>
        </div>
      </header>

      <div className="card-box list-box">
        {loading && (
          <div className="employee-row"><span className="emp-name">Loading departments…</span></div>
        )}
        {!loading && filteredDepartments.length === 0 && (
          <div className="employee-row"><span className="emp-name">No departments yet.</span></div>
        )}
        {!loading && filteredDepartments.map((dept) => (
          <div
            key={dept.id}
            className="employee-row hover-slide-container clickable"
            onClick={() => onSelectDepartment(dept)}
          >
            <div className="dept-info-stack">
              <span className="emp-name">{dept.name}</span>
            </div>

            {isOwner && (
              <button
                className="slide-bin-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openModal('DELETE_DEPARTMENT', dept);
                }}
                title="Delete Department"
              >
                <img src={trashIcon} alt="Delete" width={30} height={30} />
              </button>
            )}
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="center-action" style={{ marginTop: 40 }}>
          <button className="primary-btn" onClick={() => openModal('ADD_DEPARTMENT')}>
            + add department
          </button>
        </div>
      )}
    </div>
  );
};

export default DepartmentsScreen;
